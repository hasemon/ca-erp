<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Payment;
use App\Models\PostingRule;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\Voucher;
use Illuminate\Database\Seeder;

class PostingRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // helper for account codes
        $acc = fn ($code) => Account::query()->where('code', $code)->first();

        // Mapped Account Codes from ChartOfAccountSeeder
        $salesAcc = 'IN0001-01'; // Product Sales
        $taxPayAcc = 'L1040-01'; // Sales Tax Payable
        $invAcc = 'A0002-01'; // Product Inventory
        $cogsAcc = 'X5111'; // Cost of Purchase (COGS)
        $taxRecAcc = 'X5010-05'; // Tax, CNF & Others
        $discountAcc = 'X5023'; // Discount & Promotional Coupons
        $returnsRefundsAcc = 'X5110'; // Returns and Refunds
        $otherIncomeAcc = 'I0002'; // Other Income
        $cashAcc = 'A0001-01'; // Cash
        $bankAcc = 'A0001-02'; // Bank
        $bkashAcc = 'A0001-03-01'; // bKash
        $nagadAcc = 'A0001-03-02'; // Nagad
        $sslAcc = 'A0001-04-01'; // SSLCommerz
        $aamarPayAcc = 'A0001-04-02'; // AamarPay
        $receivableAcc = 'A0003-01'; // Customer Receivables
        $payableAcc = 'L0001-01'; // Supplier Payables
        $prepaymentAcc = 'L1030-01'; // Customer Prepayments
        $employeeAdvanceAcc = 'A0007-01'; // Employee & Other Advances
        $wipAcc = 'A0002-02'; // Work in Progress (WIP)

        $rules = [
            /*
            |--------------------------------------------------------------------------
            | 🛒 INVOICE (SALE)
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => Sale::class,
                'event' => 'created',
                'name' => 'Sale: Debit Customer Receivables',
                'description' => 'Increase in assets (Receivable from customer)',
                'type' => 'debit',
                'amount_field' => 'total',
                'is_dynamic' => true,
                'dynamic_key' => 'customer_receivable',
                'order' => 1,
            ],
            [
                'document_type' => Sale::class,
                'event' => 'created',
                'name' => 'Sale: Credit Product Sales',
                'description' => 'Increase in revenue (Sales Income)',
                'type' => 'credit',
                'amount_field' => 'subtotal',
                'is_dynamic' => false,
                'accounts' => [$salesAcc],
                'order' => 2,
            ],
            [
                'document_type' => Sale::class,
                'event' => 'created',
                'name' => 'Sale: Debit Discount Allowed',
                'description' => 'Increase in expense (Discount allowed)',
                'type' => 'debit',
                'amount_field' => 'discount',
                'is_dynamic' => false,
                'accounts' => [$discountAcc],
                'order' => 3,
            ],
            [
                'document_type' => Sale::class,
                'event' => 'created',
                'name' => 'Sale: Credit Customer Receivables Discount',
                'description' => 'Decrease in assets (Adjustment for discount)',
                'type' => 'credit',
                'amount_field' => 'discount',
                'is_dynamic' => true,
                'dynamic_key' => 'customer_receivable',
                'order' => 4,
            ],
            [
                'document_type' => Sale::class,
                'event' => 'created',
                'name' => 'Sale: Credit Sales Tax Payable',
                'description' => 'Increase in liability (Tax collected)',
                'type' => 'credit',
                'amount_field' => 'tax',
                'is_dynamic' => false,
                'accounts' => [$taxPayAcc],
                'order' => 5,
            ],
            [
                'document_type' => Sale::class,
                'event' => 'created',
                'name' => 'Sale: Debit COGS',
                'description' => 'COGS expense recognised at point of sale',
                'type' => 'debit',
                'amount_field' => 'cost_total',
                'is_dynamic' => false,
                'accounts' => [$cogsAcc],
                'order' => 6,
            ],
            [
                'document_type' => Sale::class,
                'event' => 'created',
                'name' => 'Sale: Credit Product Inventory',
                'description' => 'Inventory asset reduced when goods are sold',
                'type' => 'credit',
                'amount_field' => 'cost_total',
                'is_dynamic' => false,
                'accounts' => [$invAcc],
                'order' => 7,
            ],

            /*
            |--------------------------------------------------------------------------
            | ↩ SALE RETURN
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => SaleReturn::class,
                'event' => 'created',
                'name' => 'Sale Return: Credit Customer Receivables',
                'description' => 'Decrease in assets (Reduce owed amount or add credit)',
                'type' => 'credit',
                'amount_field' => 'refund_due',
                'is_dynamic' => true,
                'dynamic_key' => 'customer_receivable',
                'order' => 1,
            ],
            [
                'document_type' => SaleReturn::class,
                'event' => 'created',
                'name' => 'Sale Return: Debit Returns and Refunds',
                'description' => 'Increase in expense (Cost of return)',
                'type' => 'debit',
                'amount_field' => 'return_subtotal',
                'is_dynamic' => false,
                'accounts' => [$returnsRefundsAcc],
                'order' => 2,
            ],
            [
                'document_type' => SaleReturn::class,
                'event' => 'created',
                'name' => 'Sale Return: Debit Sales Tax Payable',
                'description' => 'Decrease in liability (Reduce tax owed)',
                'type' => 'debit',
                'amount_field' => 'tax',
                'is_dynamic' => false,
                'accounts' => [$taxPayAcc],
                'order' => 3,
            ],
            [
                'document_type' => SaleReturn::class,
                'event' => 'created',
                'name' => 'Sale Return: Credit Other Income',
                'description' => 'Increase in income (Policy deduction fee)',
                'type' => 'credit',
                'amount_field' => 'policy_fee',
                'is_dynamic' => false,
                'accounts' => [$otherIncomeAcc],
                'order' => 4,
            ],
            [
                'document_type' => SaleReturn::class,
                'event' => 'created',
                'name' => 'Sale Return: Debit Product Inventory',
                'description' => 'Inventory asset restored',
                'type' => 'debit',
                'amount_field' => 'cost_total',
                'is_dynamic' => false,
                'accounts' => [$invAcc],
                'order' => 5,
            ],
            [
                'document_type' => SaleReturn::class,
                'event' => 'created',
                'name' => 'Sale Return: Credit COGS',
                'description' => 'COGS reversal',
                'type' => 'credit',
                'amount_field' => 'cost_total',
                'is_dynamic' => false,
                'accounts' => [$cogsAcc],
                'order' => 6,
            ],

            /*
            |--------------------------------------------------------------------------
            | 📦 PURCHASE
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => Purchase::class,
                'event' => 'created',
                'name' => 'Purchase: Credit Supplier',
                'description' => 'Increase in liability (Payable to supplier)',
                'type' => 'credit',
                'amount_field' => 'total',
                'is_dynamic' => true,
                'dynamic_key' => 'supplier_payable',
                'order' => 1,
            ],
            [
                'document_type' => Purchase::class,
                'event' => 'created',
                'name' => 'Purchase: Debit Inventory',
                'description' => 'Increase in inventory asset (Goods received)',
                'type' => 'debit',
                'amount_field' => 'subtotal',
                'is_dynamic' => false,
                'accounts' => [$invAcc],
                'order' => 2,
            ],
            [
                'document_type' => Purchase::class,
                'event' => 'created',
                'name' => 'Purchase: Debit Tax',
                'description' => 'Increase in expenses (Tax paid on purchase)',
                'type' => 'debit',
                'amount_field' => 'tax',
                'is_dynamic' => false,
                'accounts' => [$taxRecAcc],
                'order' => 3,
            ],
            [
                'document_type' => Purchase::class,
                'event' => 'created',
                'name' => 'Purchase: Dr Supplier (Discount)',
                'description' => 'Decrease in liability (Adjustment for global discount)',
                'type' => 'debit',
                'amount_field' => 'discount',
                'is_dynamic' => true,
                'dynamic_key' => 'supplier_payable',
                'order' => 4,
            ],
            [
                'document_type' => Purchase::class,
                'event' => 'created',
                'name' => 'Purchase: Cr Discount Received',
                'description' => 'Increase in income (Discount Received)',
                'type' => 'credit',
                'amount_field' => 'discount',
                'is_dynamic' => false,
                'accounts' => ['I0002-02'], // Discount Received
                'order' => 5,
            ],
            [
                'document_type' => Purchase::class,
                'event' => 'created',
                'name' => 'Purchase: Dr Supplier (Payment)',
                'description' => 'Decrease in liability (Payment made to supplier)',
                'type' => 'debit',
                'amount_field' => 'payment_amount',
                'is_dynamic' => true,
                'dynamic_key' => 'supplier_payable',
                'is_optional' => true,
                'order' => 6,
            ],
            [
                'document_type' => Purchase::class,
                'event' => 'created',
                'name' => 'Purchase: Cr Asset Account (Payment)',
                'description' => 'Decrease in asset (Cash/Bank paid)',
                'type' => 'credit',
                'amount_field' => 'payment_amount',
                'is_dynamic' => true,
                'dynamic_key' => 'payment_account',
                'is_optional' => true,
                'accounts' => [$cashAcc, $bankAcc, $bkashAcc, $nagadAcc, $sslAcc, $aamarPayAcc],
                'order' => 7,
            ],

            /*
            |--------------------------------------------------------------------------
            | 💸 RECEIPT VOUCHER
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => 'App\Models\ReceiptVoucher', // Using string for specific UI mapping
                'event' => 'created',
                'name' => 'Receipt: Debit Cash/Bank',
                'description' => 'Cash/Bank balance increases',
                'type' => 'debit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$cashAcc, $bankAcc, $bkashAcc, $nagadAcc, $sslAcc, $aamarPayAcc],
                'order' => 1,
            ],
            [
                'document_type' => 'App\Models\ReceiptVoucher',
                'event' => 'created',
                'name' => 'Receipt: Credit Source',
                'description' => 'Receivable/Income account credited',
                'type' => 'credit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$receivableAcc, $prepaymentAcc, 'EQ0001-01', 'EQ0001-02'],
                'order' => 2,
            ],

            /*
            |--------------------------------------------------------------------------
            | 💳 PAYMENT VOUCHER
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => 'App\Models\PaymentVoucher',
                'event' => 'created',
                'name' => 'Payment: Debit Head',
                'description' => 'Liability decreases or Expense increases',
                'type' => 'debit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$payableAcc, 'L1040-01', 'X5080-03'], // Supplier, Tax, Salary
                'order' => 1,
            ],
            [
                'document_type' => 'App\Models\PaymentVoucher',
                'event' => 'created',
                'name' => 'Payment: Credit Cash/Bank',
                'description' => 'Asset (Cash/Bank) decreases',
                'type' => 'credit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$cashAcc, $bankAcc, $bkashAcc, $nagadAcc],
                'order' => 2,
            ],

            /*
            |--------------------------------------------------------------------------
            | 📔 JOURNAL VOUCHER
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => 'App\Models\JournalVoucher',
                'event' => 'created',
                'name' => 'Journal: Selected Debit Accounts',
                'description' => 'Asset increases or Expense increases or Liability decreases',
                'type' => 'debit',
                'amount_field' => 'item_amount',
                'is_dynamic' => true,
                'dynamic_key' => 'selected_journal_accounts',
                'order' => 1,
            ],
            [
                'document_type' => 'App\Models\JournalVoucher',
                'event' => 'created',
                'name' => 'Journal: Selected Credit Accounts',
                'description' => 'Liability increases or Income increases or Asset decreases',
                'type' => 'credit',
                'amount_field' => 'item_amount',
                'is_dynamic' => true,
                'dynamic_key' => 'selected_journal_accounts',
                'order' => 2,
            ],

            /*
            |--------------------------------------------------------------------------
            | 🔄 CONTRA VOUCHER
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => 'App\Models\ContraVoucher',
                'event' => 'created',
                'name' => 'Contra: Debit To Account',
                'description' => 'Increase in destination account',
                'type' => 'debit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$cashAcc, $bankAcc, $bkashAcc, $nagadAcc],
                'order' => 1,
            ],
            [
                'document_type' => 'App\Models\ContraVoucher',
                'event' => 'created',
                'name' => 'Contra: Credit From Account',
                'description' => 'Decrease in source account',
                'type' => 'credit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$cashAcc, $bankAcc, $bkashAcc, $nagadAcc],
                'order' => 2,
            ],

            /*
            |--------------------------------------------------------------------------
            | 📑 EXPENSE VOUCHER
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => 'App\Models\ExpenseVoucher',
                'event' => 'created',
                'name' => 'Expense: Debit Expense Head',
                'description' => 'Expense increases',
                'type' => 'debit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => ['X5010', 'X5120', 'X5020', 'X5070', 'X5080'], // Broad groups
                'order' => 1,
            ],
            [
                'document_type' => 'App\Models\ExpenseVoucher',
                'event' => 'created',
                'name' => 'Expense: Credit Cash/Bank',
                'description' => 'Asset (Cash/Bank) decreases',
                'type' => 'credit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$cashAcc, $bankAcc],
                'order' => 2,
            ],

            /*
            |--------------------------------------------------------------------------
            | 🧾 ADVANCE VOUCHER
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => 'App\Models\AdvanceVoucher',
                'event' => 'created',
                'name' => 'Advance Given: Debit Employee & Other Advances',
                'description' => 'Asset account balance increases (Given)',
                'type' => 'debit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$employeeAdvanceAcc],
                'conditions' => ['advance_type' => 'given'],
                'order' => 1,
            ],
            [
                'document_type' => 'App\Models\AdvanceVoucher',
                'event' => 'created',
                'name' => 'Advance Given: Credit Cash/Mobile/Gateway',
                'description' => 'Cash/Bank account balance decreases (Given)',
                'type' => 'credit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$nagadAcc, $sslAcc, $aamarPayAcc, $bkashAcc, $cashAcc],
                'conditions' => ['advance_type' => 'given'],
                'order' => 2,
            ],
            [
                'document_type' => 'App\Models\AdvanceVoucher',
                'event' => 'created',
                'name' => 'Advance Received: Debit Cash/Mobile/Gateway',
                'description' => 'Cash/Bank account balance increases (Received)',
                'type' => 'debit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$nagadAcc, $sslAcc, $aamarPayAcc, $bkashAcc, $cashAcc],
                'conditions' => ['advance_type' => 'received'],
                'order' => 3,
            ],
            [
                'document_type' => 'App\Models\AdvanceVoucher',
                'event' => 'created',
                'name' => 'Advance Received: Credit Advance from Customer',
                'description' => 'Liability account balance increases (Received)',
                'type' => 'credit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$prepaymentAcc],
                'conditions' => ['advance_type' => 'received'],
                'order' => 4,
            ],

            /*
            |--------------------------------------------------------------------------
            | ↩ REFUND VOUCHER
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => 'App\Models\RefundVoucher',
                'event' => 'created',
                'name' => 'Refund: Debit Returns and Refunds',
                'description' => 'Expense/Liability account debited',
                'type' => 'debit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$returnsRefundsAcc],
                'order' => 1,
            ],
            [
                'document_type' => 'App\Models\RefundVoucher',
                'event' => 'created',
                'name' => 'Refund: Credit Cash/Mobile/Gateway',
                'description' => 'Cash/Bank balance decreases',
                'type' => 'credit',
                'amount_field' => 'total_amount',
                'is_dynamic' => false,
                'accounts' => [$nagadAcc, $sslAcc, $aamarPayAcc, $bkashAcc, $cashAcc],
                'order' => 2,
            ],

            /*
            |--------------------------------------------------------------------------
            | 🏭 PRODUCTION (MATERIAL ISSUE)
            |--------------------------------------------------------------------------
            */
            [
                'document_type' => 'App\Models\MaterialIssue',
                'event' => 'created',
                'name' => 'Material Issue: Dr WIP',
                'description' => 'Increase in WIP asset',
                'type' => 'debit',
                'amount_field' => 'cost_total',
                'is_dynamic' => false,
                'accounts' => [$wipAcc],
                'order' => 1,
            ],
            [
                'document_type' => 'App\Models\MaterialIssue',
                'event' => 'created',
                'name' => 'Material Issue: Cr Inventory',
                'description' => 'Decrease in raw material asset',
                'type' => 'credit',
                'amount_field' => 'cost_total',
                'is_dynamic' => false,
                'accounts' => [$invAcc],
                'order' => 2,
            ],
            [
                'document_type' => Payment::class,
                'event' => 'created',
                'name' => 'Payment: Debit Supplier Payable',
                'description' => 'Decrease in liability (Payable to supplier)',
                'type' => 'debit',
                'amount_field' => 'amount',
                'is_dynamic' => true,
                'dynamic_key' => 'supplier_payable',
                'conditions' => ['data.context' => 'purchase_payment'],
                'order' => 1,
            ],
            [
                'document_type' => Payment::class,
                'event' => 'created',
                'name' => 'Payment: Credit Cash/Bank',
                'description' => 'Decrease in asset (Cash/Bank paid)',
                'type' => 'credit',
                'amount_field' => 'amount',
                'is_dynamic' => true,
                'dynamic_key' => 'payment_account',
                'accounts' => [$cashAcc, $bankAcc, $bkashAcc, $nagadAcc, $sslAcc, $aamarPayAcc],
                'conditions' => ['data.context' => 'purchase_payment'],
                'order' => 2,
            ],
            [
                'document_type' => Payment::class,
                'event' => 'created',
                'name' => 'Sale Payment: Debit Cash/Bank',
                'description' => 'Increase in assets (Cash received)',
                'type' => 'debit',
                'amount_field' => 'amount',
                'is_dynamic' => true,
                'dynamic_key' => 'payment_account',
                'accounts' => [$cashAcc, $bankAcc, $bkashAcc, $nagadAcc, $sslAcc, $aamarPayAcc],
                'conditions' => ['data.context' => 'sale_payment'],
                'order' => 1,
            ],
            [
                'document_type' => Payment::class,
                'event' => 'created',
                'name' => 'Sale Payment: Credit Customer Receivables',
                'description' => 'Decrease in assets (Receivable settle)',
                'type' => 'credit',
                'amount_field' => 'amount',
                'is_dynamic' => true,
                'dynamic_key' => 'customer_receivable',
                'conditions' => ['data.context' => 'sale_payment'],
                'order' => 2,
            ],
            [
                'document_type' => Payment::class,
                'event' => 'created',
                'name' => 'Sale Refund: Credit Cash/Bank',
                'description' => 'Decrease in assets (Cash paid out)',
                'type' => 'credit',
                'amount_field' => 'amount',
                'is_dynamic' => true,
                'dynamic_key' => 'payment_account',
                'accounts' => [$cashAcc, $bankAcc, $bkashAcc, $nagadAcc, $sslAcc, $aamarPayAcc],
                'conditions' => ['data.context' => 'sale_refund'],
                'order' => 1,
            ],
            [
                'document_type' => Payment::class,
                'event' => 'created',
                'name' => 'Sale Refund: Debit Customer Receivables',
                'description' => 'Increase in assets (Offset the credit balance)',
                'type' => 'debit',
                'amount_field' => 'amount',
                'is_dynamic' => true,
                'dynamic_key' => 'customer_receivable',
                'conditions' => ['data.context' => 'sale_refund'],
                'order' => 2,
            ],
        ];

        PostingRule::query()
            ->where('document_type', Sale::class)
            ->whereIn('name', [
                'Invoice: Debit Customer',
                'Invoice: Credit Sales',
                'Invoice: Credit Tax',
                'Invoice: Dr COGS',
                'Invoice: Cr Inventory',
            ])
            ->delete();

        foreach ($rules as $ruleData) {
            $accounts = $ruleData['accounts'] ?? [];
            unset($ruleData['accounts']);

            $rule = PostingRule::updateOrCreate(
                [
                    'document_type' => $ruleData['document_type'],
                    'type' => $ruleData['type'],
                    'name' => $ruleData['name'],
                ],
                $ruleData
            );

            // Sync accounts
            $accountIds = [];
            foreach ($accounts as $code) {
                $account = $acc($code);
                if ($account) {
                    $accountIds[] = $account->id;
                }
            }
            $rule->accounts()->sync($accountIds);
        }
    }
}
