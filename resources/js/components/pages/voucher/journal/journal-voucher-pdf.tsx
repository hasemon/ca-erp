import { VoucherType } from '@/types/voucher-type';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: 1,
        paddingBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 16,
    },
    section: {
        marginVertical: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 100,
        fontWeight: 'bold',
    },
    value: {
        flex: 1,
        marginTop: 2,
    },
    table: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderColor: '#000',
        fontWeight: 'bold',
        padding: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
        padding: 5,
    },
    colType: { width: '10%' },
    colAccount: { width: '40%' },
    colContact: { width: '20%' },
    colDebit: { width: '15%', textAlign: 'right' },
    colCredit: { width: '15%', textAlign: 'right' },
    total: {
        flexDirection: 'row',
        marginTop: 10,
        borderTopWidth: 1,
        paddingTop: 5,
    },
    totalLabel: {
        flex: 1,
        textAlign: 'right',
        paddingRight: 10,
        fontWeight: 'bold',
    },
    totalValue: {
        width: 100,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    footer: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signature: {
        width: 150,
        borderTopWidth: 1,
        textAlign: 'center',
        paddingTop: 5,
    },
});

export const JournalVoucherPDF = ({ voucher }: { voucher: VoucherType }) => {
    const totalDebits = voucher.voucher_items
        .filter((item) => item.type.value === 'debit')
        .reduce(
            (sum, item) => sum + (parseFloat(item.amount.toString()) || 0),
            0,
        );
    const totalCredits = voucher.voucher_items
        .filter((item) => item.type.value === 'credit')
        .reduce(
            (sum, item) => sum + (parseFloat(item.amount.toString()) || 0),
            0,
        );

    const creditPartner = voucher.voucher_items.find(
        (i) => i.type.value === 'credit' && i.business_partner,
    )?.business_partner;
    const debitPartner = voucher.voucher_items.find(
        (i) => i.type.value === 'debit' && i.business_partner,
    )?.business_partner;
    const creditAccount = voucher.voucher_items.find(
        (i) => i.type.value === 'credit',
    )?.account;
    const debitAccount = voucher.voucher_items.find(
        (i) => i.type.value === 'debit',
    )?.account;
    const transactionRef = voucher.voucher_items.find(
        (i) => i.remarks,
    )?.remarks;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>JOURNAL VOUCHER</Text>
                    <Text style={styles.subtitle}>{voucher.voucher_no}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>
                            {format(new Date(voucher.date_time), 'PPP')}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={styles.value}>{voucher.status.label}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Credit (From):</Text>
                        <Text style={styles.value}>
                            {creditPartner
                                ? creditPartner.email
                                    ? `${creditPartner.name} (${creditPartner.email})`
                                    : creditPartner.name
                                : creditAccount?.name || '-'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Debit (To):</Text>
                        <Text style={styles.value}>
                            {debitPartner
                                ? debitPartner.email
                                    ? `${debitPartner.name} (${debitPartner.email})`
                                    : debitPartner.name
                                : debitAccount?.name || '-'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Account (Credit):</Text>
                        <Text style={styles.value}>
                            {creditAccount?.name || '-'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Account (Debit):</Text>
                        <Text style={styles.value}>
                            {debitAccount?.name || '-'}
                        </Text>
                    </View>
                    {transactionRef && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Reference:</Text>
                            <Text style={styles.value}>{transactionRef}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colType}>Type</Text>
                        <Text style={styles.colAccount}>Account</Text>
                        <Text style={styles.colContact}>Contact</Text>
                        <Text style={styles.colDebit}>Debit</Text>
                        <Text style={styles.colCredit}>Credit</Text>
                    </View>
                    {voucher.voucher_items.map((item, idx) => (
                        <View key={item.id || idx} style={styles.tableRow}>
                            <Text style={styles.colType}>
                                {item.type.value}
                            </Text>
                            <Text style={styles.colAccount}>
                                {item.account?.name}
                            </Text>
                            <Text style={styles.colContact}>
                                {item.business_partner?.name || '-'}
                            </Text>
                            <Text style={styles.colDebit}>
                                {item.type.value === 'debit'
                                    ? Number(item.amount).toFixed(2)
                                    : ''}
                            </Text>
                            <Text style={styles.colCredit}>
                                {item.type.value === 'credit'
                                    ? Number(item.amount).toFixed(2)
                                    : ''}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.total}>
                    <Text style={styles.totalLabel}>Total Debit:</Text>
                    <Text style={styles.totalValue}>
                        {totalDebits.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.total}>
                    <Text style={styles.totalLabel}>Total Credit:</Text>
                    <Text style={styles.totalValue}>
                        {totalCredits.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.total}>
                    <Text style={styles.totalLabel}>Voucher Total:</Text>
                    <Text style={styles.totalValue}>
                        {voucher.total_amount}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{voucher.description}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.signature}>
                        <Text>Prepared By</Text>
                    </View>
                    <View style={styles.signature}>
                        <Text>Approved By</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
