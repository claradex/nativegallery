<?php

namespace App\Controllers\Exec\Tasks;
require_once __DIR__ . '/../../../../vendor/autoload.php';
use Symfony\Component\Yaml\Yaml;
define("NGALLERY", Yaml::parse(file_get_contents(__DIR__ . '/../../../../ngallery.yaml'))['ngallery']);
use App\Services\{Router, Auth, DB, Json, Date};
use App\Controllers\ExceptionRegister;
use App\Core\Page;

class ExecContests
{
    public static function run()
    {
        if (NGALLERY['root']['contests']['enabled'] != true) {
            echo "Contests on this server disabled. Skip...";
            exit;
        }
        $contests = DB::query('SELECT * FROM contests WHERE status < 3');
        foreach ($contests as $contest) {
            self::processContest($contest);
        }
    }

    private static function processContest(array $contest)
    {
        echo "Checking contest ID {$contest['id']}\n";

        switch ($contest['status']) {
            case 0:
                self::handleOpenPretends($contest);
                break;
            case 1:
                self::handleClosePretends($contest);
                break;
            case 2:
                self::handleClosingContest($contest);
                break;
        }
    }

    private static function handleOpenPretends(array $contest)
    {
        if (self::isAnotherContestInStatus(1)) {
            echo "[{$contest['id']}] Waiting for another contest to complete dialing. Skip...\n";
            return;
        }

        if ($contest['openpretendsdate'] <= time()) {
            DB::query('UPDATE contests SET status = 1 WHERE id = :id', [':id' => $contest['id']]);
            echo "[{$contest['id']}] Opened for pretends.\n";
        } else {
            echo "[{$contest['id']}] Not ready for open pretends. Skip...\n";
        }
    }

    private static function handleClosePretends(array $contest)
    {
        if (self::isAnotherContestInStatus(2)) {
            echo "[{$contest['id']}] Waiting for another contest to end. Skip...\n";
            return;
        }

        if ($contest['closepretendsdate'] <= time() && $contest['opendate'] <= time()) {
            DB::query('UPDATE contests SET status = 2 WHERE id = :id', [':id' => $contest['id']]);
            echo "[{$contest['id']}] Closed for pretends.\n";
        } else {
            echo "[{$contest['id']}] Not closed for pretends. Skip...\n";
        }
    }

    private static function handleClosingContest(array $contest)
    {
        if ($contest['closedate'] > time()) {
            echo "[{$contest['id']}] Waiting for end time. Skip...\n";
            return;
        }

        echo "[{$contest['id']}] Ready for closing!\n";
        self::processVotes($contest);
        DB::query('UPDATE contests SET status = 3 WHERE id = :id', [':id' => $contest['id']]);
        echo "[{$contest['id']}] Closed.\n";
        if (NGALLERY['root']['contests']['autonew']['enabled'] === true) {
            echo "Creating new contest...";
            $theme = DB::query('SELECT * FROM contests_themes WHERE status=1 ORDER BY RAND() LIMIT 1')[0];
            $time = time();
            if (NGALLERY['root']['contests']['autonew']['pretendsopen'] === 'now') {
                $pretendsopen = $time;
            } else {
                $pretendsopen = Date::addTime(NGALLERY['root']['contests']['autonew']['pretendsopen']);
            }

            $pretendsclose = Date::addTime(NGALLERY['root']['contests']['autonew']['pretendsclose']);
            if (NGALLERY['root']['contests']['autonew']['open'] === 'now') {
                $contestopen = $pretendsclose;
            } else {
                $contestopen = Date::addTime(NGALLERY['root']['contests']['autonew']['open']);
            }
            $contestclose = Date::addTime(NGALLERY['root']['contests']['autonew']['close']);
            DB::query('INSERT INTO contests VALUES (\'0\', :themeid, :openprdate, :closeprdate, :opendate, :closedate, 0)', array(':themeid'=>$theme['id'], ':openprdate'=>$pretendsopen, ':closeprdate'=>$pretendsclose, ':opendate'=>$contestopen, ':closedate'=>$contestclose));
            echo "Contest created! Continue...";
        }
     }

    private static function processVotes(array $contest)
    {
        $votes = DB::query(
            'SELECT user_id, photo_id, COUNT(*) AS vote_count 
             FROM photos_rates_contest WHERE contest_id = :id 
             GROUP BY user_id ORDER BY vote_count DESC LIMIT 3',
            [':id' => $contest['id']]
        );

        $place = 1;
        foreach ($votes as $vote) {
            self::updatePhotoContent($vote, $contest, $place);
            $place++;
        }
    }

    private static function updatePhotoContent(array $vote, array $contest, int $place)
    {
        $photo = DB::query('SELECT * FROM photos WHERE id = :id', [':id' => $vote['photo_id']])[0];
        $photoData = json_decode($photo['content'], true);
        
        $theme = DB::query('SELECT title FROM contests_themes WHERE id = :id', [':id' => $contest['themeid']])[0]['title'];
        
        $photoData['contests'] = [
            'id' => $contest['id'],
            'contesttheme' => $theme,
            'votenum' => $vote['vote_count'],
            'place' => $place
        ];
        
        DB::query('UPDATE photos SET content = :content WHERE id = :id', [
            ':id' => $vote['photo_id'],
            ':content' => json_encode($photoData)
        ]);
    }

    private static function isAnotherContestInStatus(int $status): bool
    {
        return !empty(DB::query('SELECT status FROM contests WHERE status = :status', [':status' => $status]));
    }
}

if (php_sapi_name() === 'cli') {
    ExecContests::run();
}
