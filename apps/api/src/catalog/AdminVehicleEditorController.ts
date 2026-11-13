import { All, BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get, Header, NotFoundException, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { database, Prisma } from '@nativegallery/database';
import { AuthService } from '../auth/AuthService';

function parseId(raw: unknown) {
  const id = Number(raw);
  if (typeof raw !== 'string' || !/^\d{1,10}$/.test(raw) || id < 1 || id > 2147483647) throw new BadRequestException();
  return id;
}

function escape(value: string) {
  return value.replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);
}

@Controller('api/admin')
export class AdminVehicleEditorController {
  constructor(private readonly auth: AuthService) {}

  private async authorize(request: Request) {
    const viewer = await this.auth.viewer(request);
    if (!viewer?.admin || viewer.admin === 2) throw new ForbiddenException();
  }

  private async fields(id: number) {
    const entity = await database.entity.findUnique({ where: { id }, select: { sampledata: true } });
    if (!entity) throw new NotFoundException();
    let data: unknown;
    try { data = JSON.parse(entity.sampledata); } catch { throw new BadRequestException(); }
    if (!data || typeof data !== 'object') throw new BadRequestException();
    return Object.values(data).map((value, index) => ({
      name: 'modelinput_' + (index + 1),
      label: typeof value?.name === 'string' ? value.name : '',
      required: value?.important === '1' || value?.important === 1,
    }));
  }

  @Get('models/fields/:id')
  async modelFields(@Req() request: Request, @Param('id') id: string) {
    await this.authorize(request);
    return this.fields(parseId(id));
  }

  @All('getvehicleinputs/:id')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async legacyFields(@Req() request: Request, @Param('id') id: string) {
    const fields = await this.modelFields(request, id);
    return fields.map(({ name, label, required }) =>
      '<div class="mt-3"><label class="form-label" for="' + name + '">' + escape(label) +
      '</label><input type="text" class="form-control" id="' + name + '" name="' + name +
      '" placeholder="' + escape(label) + '"' + (required ? ' required' : '') + '></div>').join('');
  }

  @Get('models/catalog/:id')
  @Header('Cache-Control', 'private, no-store')
  async getModel(@Req() request: Request, @Param('id') rawId: string) {
    await this.authorize(request);
    const model = await database.entityData.findUnique({
      where: { id: parseId(rawId) }, select: { id: true, entityid: true, title: true, comment: true, content: true },
    });
    if (!model) throw new NotFoundException();
    return model;
  }

  @Patch('models/catalog/:id')
  async update(@Req() request: Request, @Param('id') rawId: string, @Body() body: Record<string, unknown>) {
    await this.authorize(request);
    const id = parseId(rawId);
    const model = await database.entityData.findUnique({ where: { id }, select: { entityid: true } });
    if (!model) throw new NotFoundException();
    const data = await this.modelData(model.entityid, body);
    const result = await database.entityData.updateMany({ where: { id, entityid: model.entityid }, data });
    if (!result.count) throw new NotFoundException();
    return { id };
  }

  @Delete('models/catalog/:id')
  async remove(@Req() request: Request, @Param('id') rawId: string) {
    await this.authorize(request);
    const id = parseId(rawId);
    await database.$transaction(async tx => {
      const [model] = await tx.$queryRaw<{ id: number }[]>(Prisma.sql`
        SELECT id FROM entities_data WHERE id = ${id} FOR UPDATE
      `);
      if (!model) throw new NotFoundException();
      const photo = await tx.photo.findFirst({ where: { entitydata_id: id }, select: { id: true } });
      if (photo) throw new ConflictException('К модели привязаны фотографии.');
      await tx.entityData.delete({ where: { id } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { id };
  }

  @Post('models/catalog')
  async create(@Req() request: Request, @Body() body: Record<string, unknown>) {
    await this.authorize(request);
    const entityid = parseId(body?.entityid);
    const data = await this.modelData(entityid, body);
    return database.entityData.create({
      data: { ...data, entityid, createdate: BigInt(Math.floor(Date.now() / 1000)) }, select: { id: true },
    });
  }

  private async modelData(entityid: number, body: Record<string, unknown>) {
    const title = body?.title;
    const comment = body.comment;
    if (typeof title !== 'string' || !title.trim() || Buffer.byteLength(title) > 65535 ||
        typeof comment !== 'string' || !comment.trim() || Buffer.byteLength(comment) > 65535) throw new BadRequestException();

    const fields = await this.fields(entityid);
    const values = fields.map(({ name, required }, index) => {
      const value = body[name] ?? '';
      if (typeof value !== 'string' || (required && !value.trim())) throw new BadRequestException();
      return [index + 1, { value }];
    });
    const content = JSON.stringify(Object.fromEntries(values));
    if (Buffer.byteLength(content) > 65535) throw new BadRequestException();
    return { title: title.trim(), comment, content };
  }
}
