<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('accounts')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->name('accounts.index')->middleware('permission:account.access');
        Route::post('/', [AccountController::class, 'store'])->name('accounts.store')->middleware('permission:account.create');
        Route::put('/{account}', [AccountController::class, 'update'])->name('accounts.update')->middleware('permission:account.edit');
        Route::delete('/{account}', [AccountController::class, 'destroy'])->name('accounts.destroy')->middleware('permission:account.delete');
    });

    Route::prefix('vouchers')->group(function () {
        Route::prefix('expense')->group(function () {
            Route::get('/', [VoucherController::class, 'createExpense'])->name('vouchers.expense.create')->middleware('permission:voucher.create');
            Route::post('/', [VoucherController::class, 'storeExpense'])->name('vouchers.expense.store')->middleware('permission:voucher.create');
            Route::put('/{voucher}', [VoucherController::class, 'updateExpense'])->name('vouchers.expense.update')->middleware('permission:voucher.edit');
            Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.expense.destroy')->middleware('permission:voucher.delete');
        });

        Route::prefix('contra')->group(function () {
            Route::get('/', [VoucherController::class, 'createContra'])->name('vouchers.contra.create')->middleware('permission:voucher.create');
            Route::post('/', [VoucherController::class, 'storeContra'])->name('vouchers.contra.store')->middleware('permission:voucher.create');
            Route::put('/{voucher}', [VoucherController::class, 'updateContra'])->name('vouchers.contra.update')->middleware('permission:voucher.edit');
            Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.contra.destroy')->middleware('permission:voucher.delete');
        });

        Route::prefix('receipt')->group(function () {
            Route::get('/', [VoucherController::class, 'createReceipt'])->name('vouchers.receipt.create')->middleware('permission:voucher.create');
            Route::post('/', [VoucherController::class, 'storeReceipt'])->name('vouchers.receipt.store')->middleware('permission:voucher.create');
            Route::put('/{voucher}', [VoucherController::class, 'updateReceipt'])->name('vouchers.receipt.update')->middleware('permission:voucher.edit');
            Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.receipt.destroy')->middleware('permission:voucher.delete');
        });

        Route::prefix('advance')->group(function () {
            Route::get('/', [VoucherController::class, 'createAdvance'])->name('vouchers.advance.create')->middleware('permission:voucher.create');
            Route::post('/', [VoucherController::class, 'storeAdvance'])->name('vouchers.advance.store')->middleware('permission:voucher.create');
            Route::put('/{voucher}', [VoucherController::class, 'updateAdvance'])->name('vouchers.advance.update')->middleware('permission:voucher.edit');
            Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.advance.destroy')->middleware('permission:voucher.delete');
        });

        Route::prefix('refund')->group(function () {
            Route::get('/', [VoucherController::class, 'createRefund'])->name('vouchers.refund.create')->middleware('permission:voucher.create');
            Route::post('/', [VoucherController::class, 'storeRefund'])->name('vouchers.refund.store')->middleware('permission:voucher.create');
            Route::put('/{voucher}', [VoucherController::class, 'updateRefund'])->name('vouchers.refund.update')->middleware('permission:voucher.edit');
            Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.refund.destroy')->middleware('permission:voucher.delete');
        });

        Route::prefix('payment')->group(function () {
            Route::get('/', [VoucherController::class, 'createPayment'])->name('vouchers.payment.create')->middleware('permission:voucher.create');
            Route::post('/', [VoucherController::class, 'storePayment'])->name('vouchers.payment.store')->middleware('permission:voucher.create');
            Route::put('/{voucher}', [VoucherController::class, 'updatePayment'])->name('vouchers.payment.update')->middleware('permission:voucher.edit');
            Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.payment.destroy')->middleware('permission:voucher.delete');
        });

        Route::prefix('journal')->group(function () {
            Route::get('/', [VoucherController::class, 'createJournal'])->name('vouchers.journal.create')->middleware('permission:voucher.create');
            Route::post('/', [VoucherController::class, 'storeJournal'])->name('vouchers.journal.store')->middleware('permission:voucher.create');
            Route::put('/{voucher}', [VoucherController::class, 'updateJournal'])->name('vouchers.journal.update')->middleware('permission:voucher.edit');
            Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.journal.destroy')->middleware('permission:voucher.delete');
        });

        Route::post('/{voucher}/approve', [VoucherController::class, 'approve'])->name('vouchers.approve')->middleware('permission:voucher.edit');
        Route::post('/{voucher}/void', [VoucherController::class, 'void'])->name('vouchers.void')->middleware('permission:voucher.edit');
        Route::delete('/{voucher}', [VoucherController::class, 'destroy'])->name('vouchers.destroy')->middleware('permission:voucher.delete');

        Route::post('/{voucher}/lock', [VoucherController::class, 'lock'])->name('vouchers.lock')->middleware('permission:voucher-secure.access');
        Route::post('/{voucher}/unlock', [VoucherController::class, 'unlock'])->name('vouchers.unlock')->middleware('permission:voucher-secure.access');
    });

    Route::prefix('transactions')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('transactions.index')->middleware('permission:transaction.access');
    });

    Route::prefix('posting-rules')->group(function () {
        Route::get('/', [PostingRuleController::class, 'index'])->name('posting-rules.index')->middleware('permission:posting-rule.access');
        Route::put('/', [PostingRuleController::class, 'update'])->name('posting-rules.update')->middleware('permission:posting-rule.edit');
    });

    Route::prefix('business-partners')->group(function () {
        Route::get('/', [BusinessPartnerController::class, 'index'])->name('business-partners.index')->middleware('permission:business-partner.access');
        Route::get('/create', [BusinessPartnerController::class, 'create'])->name('business-partners.create')->middleware('permission:business-partner.create');
        Route::get('/{businessPartner}/edit', [BusinessPartnerController::class, 'edit'])->name('business-partners.edit')->middleware('permission:business-partner.edit');
        Route::post('/', [BusinessPartnerController::class, 'store'])->name('business-partners.store')->middleware('permission:business-partner.create');
        Route::put('/{businessPartner}', [BusinessPartnerController::class, 'update'])->name('business-partners.update')->middleware('permission:business-partner.edit');
        Route::delete('/{businessPartner}', [BusinessPartnerController::class, 'destroy'])->name('business-partners.destroy')->middleware('permission:business-partner.delete');
    });
});

require __DIR__.'/settings.php';
