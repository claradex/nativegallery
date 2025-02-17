<?php

namespace App\Controllers\Api\Contests;

use App\Services\{DB, Json};

class GetInfo
{
    private array $contest;
    private string $pretendsStatus;
    private string $publicStatus;

    public function __construct()
    {
        $this->fetchContest();
        $this->setStatuses();
        $this->outputJson();
    }

    private function fetchContest(): void
    {
        $statuses = [0, 1, 2];
        foreach ($statuses as $status) {
            $contest = DB::query('SELECT * FROM contests WHERE status = :status', [':status' => $status]);
            if (!empty($contest)) {
                $this->contest = $contest[0];
                break;
            }
        }
    }

    private function setStatuses(): void
    {
        $time = time();
        $status = $this->contest['status'] ?? null;
        
        if ($status === 0) {
            $this->pretendsStatus = ($this->contest['openpretendsdate'] > $time) ? 'waiting' : 'waitingforserver';
            $this->publicStatus = 'closed';
        } elseif ($status === 1) {
            $this->pretendsStatus = ($this->contest['closepretendsdate'] > $time) ? 'opened' : 'waitingforserver';
            $this->publicStatus = 'closed';
        } elseif ($status === 2) {
            $this->pretendsStatus = 'closed';
            $this->publicStatus = ($this->contest['closedate'] <= $time) ? 'waitingforserver' : 'opened';
        }
    }

    private function outputJson(): void
    {
        echo json_encode(array(
            'contest' => $this->contest,
            'statuses' => [
                'pretends' => $this->pretendsStatus,
                'public' => $this->publicStatus,
            ]
        ));
    }
}