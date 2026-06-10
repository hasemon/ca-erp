<?php

namespace App\Actions\Account;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UpdateAccountAction
{
    public function __invoke(array $data, Account $account, Request $request): Account
    {
        return DB::transaction(function () use ($data, $account) {
            $account->update($data);

            return $account;
        });
    }
}
