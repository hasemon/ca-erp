<?php

namespace Database\Seeders;

use App\Enums\CA\AccountActivityType;
use App\Enums\CA\AccountSubType;
use App\Models\Account;
use App\Models\AccountType;
use Illuminate\Database\Seeder;

class ChartOfAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    protected $types;

    public function run(): void
    {
        $this->types = AccountType::pluck('id', 'code');

        $this->createAccountTree('ASSET', [
            [
                'code' => 'A0001',
                'name' => 'Cash & Bank',
                'description' => 'Cash on hand and bank accounts',
                'is_group' => true,
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::NONE,
                'children' => [
                    [
                        'code' => 'A0001-01',
                        'name' => 'Cash',
                        'description' => 'Physical currency held by the business',
                        'sub_type' => AccountSubType::CASH,
                        'activity_type' => AccountActivityType::NONE,
                    ],
                    [
                        'code' => 'A0001-02',
                        'name' => 'Bank',
                        'description' => 'Funds held in the company\'s bank accounts',
                        'sub_type' => AccountSubType::BANK_ACCOUNT,
                        'activity_type' => AccountActivityType::NONE,
                    ],
                    [
                        'code' => 'A0001-03',
                        'name' => 'Mobile Banking',
                        'description' => 'Mobile financial services accounts',
                        'is_group' => true,
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::NONE,
                        'children' => [
                            [
                                'code' => 'A0001-03-01',
                                'name' => 'bKash',
                                'description' => 'Company bKash merchant account',
                                'sub_type' => AccountSubType::MOBILE_BANKING,
                                'activity_type' => AccountActivityType::NONE,
                            ],
                            [
                                'code' => 'A0001-03-02',
                                'name' => 'Nagad',
                                'description' => 'Company Nagad merchant account',
                                'sub_type' => AccountSubType::MOBILE_BANKING,
                                'activity_type' => AccountActivityType::NONE,
                            ],
                        ],
                    ],
                    [
                        'code' => 'A0001-04',
                        'name' => 'Payment Gateways',
                        'is_group' => true,
                        'children' => [
                            [
                                'code' => 'A0001-04-01',
                                'name' => 'SSLCommerz',
                                'description' => 'SSLCommerz payment gateway account',
                                'sub_type' => AccountSubType::BANK_ACCOUNT,
                                'activity_type' => AccountActivityType::NONE,
                            ],
                            [
                                'code' => 'A0001-04-02',
                                'name' => 'AamarPay',
                                'description' => 'AamarPay payment gateway account',
                                'sub_type' => AccountSubType::BANK_ACCOUNT,
                                'activity_type' => AccountActivityType::NONE,
                            ],
                        ],
                    ],
                ],
            ],
            [
                'code' => 'A0002',
                'name' => 'Inventory',
                'is_group' => true,
                'description' => 'Products held for sale',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'A0002-01',
                        'name' => 'Product Inventory',
                        'description' => 'Value of products available for sale',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'A0002-02',
                        'name' => 'Work in Progress (WIP)',
                        'description' => 'Costs associated with partially finished goods in production.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'A0003',
                'name' => 'Accounts Receivable',
                'description' => 'Money owed by customers',
                'is_group' => true,
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'A0003-01',
                        'name' => 'Customer Receivables',
                        'description' => 'Amounts owed by customers for credit sales',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'A0004',
                'name' => 'Advance to Supplier',
                'is_group' => true,
                'description' => 'Prepayments made to suppliers',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'A0004-01',
                        'name' => 'LC payment & others',
                        'description' => 'Letter of credit payments and other supplier advances',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'A0006',
                'name' => 'Supplier Advances',
                'description' => 'Prepayments made to suppliers for future goods or services',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
            ],
            [
                'code' => 'A0007',
                'name' => 'Advances to Employees & Others',
                'is_group' => true,
                'description' => 'Prepayments to employees, staff, or other parties as loans or advances.',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'A0007-01',
                        'name' => 'Employee & Other Advances',
                        'description' => 'Advances given to employees against salary or for other purposes.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'A0008',
                'name' => 'Fixed Assets',
                'is_group' => true,
                'description' => 'Long-term assets such as land, buildings, and equipment.',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::INVESTING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'A0008-01',
                        'name' => 'Land',
                        'description' => 'Value of land owned by the business.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::INVESTING_ACTIVITIES,
                    ],
                    [
                        'code' => 'A0008-02',
                        'name' => 'Building',
                        'description' => 'Value of buildings owned by the business.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::INVESTING_ACTIVITIES,
                    ],
                    [
                        'code' => 'A0008-03',
                        'name' => 'Equipment',
                        'description' => 'Value of equipment, machinery, and tools.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::INVESTING_ACTIVITIES,
                    ],
                ],
            ],
        ]);

        // LIABILITY
        $this->createAccountTree('LIABILITY', [
            [
                'code' => 'L0001',
                'name' => 'Accounts Payable',
                'description' => 'Money owed to suppliers for goods or services',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'L0001-01',
                        'name' => 'Supplier Payables',
                        'description' => 'Amounts owed for inventory purchases',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'L1020',
                'name' => 'Loans Payable',
                'description' => 'Borrowed funds from banks or other lenders',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'L1020-01',
                        'name' => 'Business Term Loan',
                        'description' => 'Long-term loans for general business purposes.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'L1030',
                'name' => 'Advance from Customer',
                'description' => 'Payments received from customers for future goods or services',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'L1030-01',
                        'name' => 'Customer Prepayments',
                        'description' => 'Advance payments for upcoming orders.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'L1040',
                'name' => 'Tax Payable',
                'description' => 'Taxes owed to government authorities',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'L1040-01',
                        'name' => 'Sales Tax Payable',
                        'description' => 'Sales tax collected from customers.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'L1050',
                'name' => 'Payroll Liabilities',
                'description' => 'Obligations related to employee compensation',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'L1050-01',
                        'name' => 'Payroll Deductions Payable',
                        'description' => 'Amounts withheld from employee salaries',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'L1050-01',
                        'name' => 'Income Tax (TDS)',
                        'description' => 'Income Tax withheld from salaries',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'L1050-02',
                        'name' => 'Health Insurance',
                        'description' => 'Health insurance premiums withheld',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'L1050-03',
                        'name' => 'Provident Fund (EPF)',
                        'description' => 'Employee provident fund contributions withheld',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
        ]);

        // EQUITY
        $this->createAccountTree('EQUITY', [
            [
                'code' => 'EQ0001',
                'name' => "Owner's Capital",
                'description' => 'The owner\'s investment in the business',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'EQ0001-01',
                        'name' => 'Initial Contribution',
                        'description' => 'The initial capital injected by the owner.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                    ],
                    [
                        'code' => 'EQ0001-02',
                        'name' => 'Additional Contribution',
                        'description' => 'Any subsequent capital added by the owner',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'EQ0002',
                'name' => 'Retained Earnings',
                'description' => 'Accumulated profits that are reinvested in the business',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'EQ0002-01',
                        'name' => 'Accumulated Earnings',
                        'description' => 'The net earnings of the company over time',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                    ],
                    [
                        'code' => 'EQ0002-02',
                        'name' => 'Net Profit/Loss for the Year',
                        'description' => 'Profit or loss for the current financial year, closed out to Retained Earnings at year end.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'EQ0003',
                'name' => "Owner's Drawings",
                'description' => 'Funds withdrawn by the owner for personal use',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'EQ0003-01',
                        'name' => 'Owner Withdrawals',
                        'description' => 'Cash or assets taken out by the owner',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'EQ0004',
                'name' => 'Opening Balance Equity',
                'description' => 'Used to record opening balances when migrating systems',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::FINANCING_ACTIVITIES,
            ],
        ]);

        // INCOME
        $this->createAccountTree('INCOME', [
            [
                'code' => 'IN0001',
                'name' => 'Sales Revenue',
                'description' => 'Primary revenue from selling goods or services',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'IN0001-01',
                        'name' => 'Product Sales',
                        'description' => 'Revenue generated from the sale of products',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'IN0001-02',
                        'name' => 'Service Sales',
                        'description' => 'Revenue generated from the sale of services',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'I0002',
                'name' => 'Other Income',
                'description' => 'Income from non-primary business activities',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'I0002-01',
                        'name' => 'Interest Income',
                        'description' => 'Interest earned from bank accounts or investments',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'I0002-02',
                        'name' => 'Discount Received',
                        'description' => 'Discounts from suppliers on early payments',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'I0002-03',
                        'name' => 'Inventory Gain',
                        'description' => 'Income from finding extra inventory during stock counts.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'I0002-04',
                        'name' => 'Late Penalty (1 Day Salary)',
                        'description' => 'Late penalty deducted from staff.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'I0002-05',
                        'name' => 'Absent Penalty (Single Day Salary)',
                        'description' => 'Absent penalty deducted from staff.',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
        ]);

        // EXPENSE
        $this->createAccountTree('EXPENSE', [
            [
                'code' => 'X5010',
                'name' => 'Cost of Goods Sold',
                'description' => 'Direct cost of purchasing inventory or products sold',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'X5010-01',
                        'name' => 'Production Cost',
                        'description' => 'Costs directly related to production',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5010-02',
                        'name' => 'LC for Goods',
                        'description' => 'Letter of credit costs for imported goods',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5010-03',
                        'name' => 'Factory Rent',
                        'description' => 'Rental cost for the production/factory facility',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5010-04',
                        'name' => 'Warehouse Rent',
                        'description' => 'Rental cost for warehouse storage',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5010-05',
                        'name' => 'Tax, CNF & Others',
                        'description' => 'Import taxes, CNF charges, and other related costs',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5010-06',
                        'name' => 'Vat & Challan',
                        'description' => 'VAT and challan charges on goods',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'X5111',
                'name' => 'Cost of Purchase',
                'description' => 'Purchase cost of items sold',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,

            ],
            [
                'code' => 'X5113',
                'name' => 'Manufacturing Variance',
                'description' => 'Difference between standard and actual production costs.',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
            ],
            [
                'code' => 'X5120',
                'name' => 'Maintenance & Repairs',
                'description' => 'Repairs to assets, systems, or software',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
            ],
            [
                'code' => 'X5130',
                'name' => 'Inventory Write-off/Loss',
                'description' => 'Expense from lost, damaged, or obsolete inventory.',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
            ],
            [
                'code' => 'X5020',
                'name' => 'Advertising & Marketing',
                'description' => 'All types of promotional and paid advertising',
                'children' => [
                    [
                        'code' => 'X5021',
                        'name' => 'Facebook/Google Ads',
                        'description' => 'Social media and search engine paid campaigns',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5022',
                        'name' => 'Influencer/Media Promotions',
                        'description' => 'Paid influencer marketing, sponsorships',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5023',
                        'name' => 'Discount & Promotional Coupons',
                        'description' => 'Discounts given as part of marketing campaigns',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'X5030',
                'name' => 'Transaction Fees',
                'description' => 'Payment gateway fees like Stripe, bKash, SSLCommerz',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
            ],
            [
                'code' => 'X5040',
                'name' => 'Platform Fees',
                'description' => 'Commission or charges from Fastflow, Daraz, Amazon, etc.',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
            ],
            [
                'code' => 'X5050',
                'name' => 'Shipping Expenses',
                'description' => 'Cost incurred for shipping products to customers',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'X5050-01',
                        'name' => 'Transport & Others',
                        'description' => 'General transport and other shipping costs',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5050-02',
                        'name' => 'Container Vara & Rent',
                        'description' => 'Container rental and vara charges',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5051',
                        'name' => 'Courier Charges',
                        'description' => 'Payments to delivery partners',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5052',
                        'name' => 'Packaging Materials',
                        'description' => 'Boxes, wraps, and delivery packaging',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'X5060',
                'name' => 'Software & Subscriptions',
                'description' => 'Recurring software services and digital tools',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'X5061',
                        'name' => 'ERP/Inventory Systems',
                        'description' => 'Subscriptions to accounting or ERP tools',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5062',
                        'name' => 'Website Hosting & Apps',
                        'description' => 'Hosting, domain, e-commerce platform costs',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'X5070',
                'name' => 'Utilities',
                'description' => 'Communication and basic operation services',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'X5070-01',
                        'name' => 'Gas Bill',
                        'description' => 'Gas utility charges',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5070-02',
                        'name' => 'Electricity Bill',
                        'description' => 'Electricity utility charges',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5070-03',
                        'name' => 'Internet Bill',
                        'description' => 'Internet connectivity charges',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5070-04',
                        'name' => 'Solar Bill',
                        'description' => 'Solar energy charges',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5070-05',
                        'name' => 'Cleaner Bill',
                        'description' => 'Cleaning service charges',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5071',
                        'name' => 'Internet Service',
                        'description' => 'Monthly broadband or mobile internet costs',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5072',
                        'name' => 'Phone Service',
                        'description' => 'Call/SMS packages or virtual phone systems',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'X5080',
                'name' => 'Salaries & Wages',
                'description' => 'Salaries and wages to employees or contractors',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'X5080-01',
                        'name' => 'Director Entertainment',
                        'description' => 'Entertainment expenses for directors',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5080-02',
                        'name' => 'Honorarium',
                        'description' => 'Honorarium payments to individuals',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5080-03',
                        'name' => 'Salary',
                        'description' => 'Regular salary payments to staff',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5080-04',
                        'name' => 'Staff Entertainment',
                        'description' => 'Entertainment and refreshment for staff',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5080-05',
                        'name' => 'Conveyance',
                        'description' => 'Travel and conveyance allowances',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5081',
                        'name' => 'Basic Salary',
                        'description' => 'Monthly base salary',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5082',
                        'name' => 'Overtime/Bonus',
                        'description' => 'Extra payments, incentives',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5083',
                        'name' => 'Meal Allowance',
                        'description' => 'Meal allowance expense',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5084',
                        'name' => 'Transport Allowance',
                        'description' => 'Transport allowance expense',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5085',
                        'name' => 'Mobile Allowance',
                        'description' => 'Mobile allowance expense',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5086',
                        'name' => 'Project Bonus',
                        'description' => 'Project bonus expense',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5087',
                        'name' => 'Perfect Attendance Bonus',
                        'description' => 'Perfect attendance bonus expense',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5088',
                        'name' => 'Overtime (Regular 1.5x)',
                        'description' => 'Regular overtime expense',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'X5090',
                'name' => 'Bank Charges',
                'description' => 'Service charges for using bank accounts',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'X5091',
                        'name' => 'Wire Transfer Fees',
                        'description' => 'Domestic/international transaction charges',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5092',
                        'name' => 'Minimum Balance Penalties',
                        'description' => 'Fees for not maintaining minimum balance',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            [
                'code' => 'X5100',
                'name' => 'Office Supplies',
                'description' => 'Daily consumables required for operation',
                'sub_type' => AccountSubType::GENERAL,
                'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                'children' => [
                    [
                        'code' => 'X5100-01',
                        'name' => 'Islamic Donation',
                        'description' => 'Charitable donations as per Islamic principles',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5100-02',
                        'name' => 'General Donation',
                        'description' => 'General charitable donations',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5100-03',
                        'name' => 'General Purchase',
                        'description' => 'Miscellaneous general purchases',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5100-04',
                        'name' => 'Advocate & Legal Fees',
                        'description' => 'Legal and advocate service fees',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5101',
                        'name' => 'Stationery',
                        'description' => 'Paper, pens, clips, registers',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                    [
                        'code' => 'X5102',
                        'name' => 'Misc Office Items',
                        'description' => 'Printer ink, storage, labels',
                        'sub_type' => AccountSubType::GENERAL,
                        'activity_type' => AccountActivityType::OPERATING_ACTIVITIES,
                    ],
                ],
            ],
            ['code' => 'X5110', 'name' => 'Returns and Refunds', 'description' => 'Refunded sales or returned items', 'sub_type' => AccountSubType::GENERAL, 'activity_type' => AccountActivityType::OPERATING_ACTIVITIES],
        ]);
    }

    private function createAccountTree($typeCode, $accounts, $parentId = null)
    {
        foreach ($accounts as $acc) {

            $account = Account::firstOrCreate(
                ['code' => $acc['code']],
                [
                    'account_type_id' => $this->types[$typeCode],
                    'parent_id' => $parentId,
                    'name' => $acc['name'],
                    'description' => $acc['description'] ?? null,
                    'sub_type' => $acc['sub_type'] ?? AccountSubType::GENERAL,
                    'activity_type' => $acc['activity_type'] ?? AccountActivityType::OPERATING_ACTIVITIES,
                    'is_group' => $acc['is_group'] ?? (! empty($acc['children'])),
                    'is_system' => true,
                ]
            );

            if (! empty($acc['children'])) {
                $this->createAccountTree($typeCode, $acc['children'], $account->id);
            }
        }
    }
}
