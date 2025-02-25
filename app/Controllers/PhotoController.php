<?php

namespace App\Controllers;

use App\Services\{Router, Auth, DB, Json};
use App\Core\Page;
use App\Models\{User, Vote, Comment, Vehicle, Photo};

class PhotoController extends NGController
{
   private ?Photo $photo = null;
   private ?User $user = null;
   private array $params = [];

   public function __construct()
   {
      $this->page = new Page();
      $this->user = new User(Auth::userid());
   }

   public function i(): void
   {
      $id = $this->getPhotoId();
      $this->photo = new Photo($id);

      if (!$this->photo->exists()) {
         $this->renderNotFound();
         return;
      }

      $this->setPhotoDetails($id);
      $this->checkModerationStatus($id);

      if ($this->params['moderated']) {
         $this->render('Photo/Index', $this->params);
      } else {
         $this->renderNotFound();
      }
   }


   public function photoext(): void
   {
      $_GET['id'] ? $this->render('Photo/Ext') : $this->renderNotFound();
   }

   private function getPhotoId(): ?int
   {
      return isset($_SERVER['REQUEST_URI']) ? (int) explode('/', $_SERVER['REQUEST_URI'])[2] : null;
   }

   private function setPhotoDetails(int $id): void
   {
      $this->params = [
         'photo_id' => $id,
         'photouser' => new User($this->photo->i('user_id')),
         'extname' => $this->photo->content('video') ? 'видео' : 'фото',
         'extnamef' => $this->photo->content('video') ? 'видеоролик' : 'фотография'
      ];

      if ($this->photo->i('entitydata_id') >= 1) {
         $entitydata = DB::query('SELECT * FROM entities_data WHERE id=:id', [':id' => $this->photo->i('entitydata_id')])[0];
         $this->params['vehicle'] = new Vehicle($entitydata['entityid']);
      }
   }

   private function checkModerationStatus(int $id): void
   {
      $moderated = $this->photo->i('moderated');

      if ($moderated === 0) {
         $this->params['moderated'] = ($this->photo->i('user_id') === Auth::userid() || $this->user->i('admin') > 0);
      } elseif ($moderated === 1) {
         $this->params['moderated'] = true;
         $this->trackPhotoView($id);
      }
   }

   private function trackPhotoView(int $id): void
   {
      $lastView = DB::query(
         'SELECT time FROM photos_views WHERE user_id=:uid AND photo_id=:pid ORDER BY id DESC LIMIT 1',
         [':uid' => Auth::userid(), ':pid' => $id]
      )[0]['time'] ?? 0;

      if ($lastView <= time() - 86400) {
         DB::query(
            'INSERT INTO photos_views VALUES (0, :uid, :pid, :time)',
            [':uid' => Auth::userid(), ':pid' => $id, ':time' => time()]
         );
      }
   }

   private function renderNotFound(): void
   {
      $this->render('Photo/NotFound', $this->params);
   }
}
