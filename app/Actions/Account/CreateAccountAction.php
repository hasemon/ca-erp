<?php

namespace App\Actions\Account;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreateAccountAction
{
    public function __invoke(array $data, Request $request): Account
    {
        return DB::transaction(function () use ($data) {
            return Account::create($data);
        });
    }
}
