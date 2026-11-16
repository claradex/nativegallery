-- Navbar colour of an entity kind: photos, vehicles and models of the kind recolour the site navbar with it,
-- the way transphoto.org paints its metro pages blue. NULL keeps the site's default colours.

ALTER TABLE `entities` ADD COLUMN `navcolor` VARCHAR(7) NULL;
