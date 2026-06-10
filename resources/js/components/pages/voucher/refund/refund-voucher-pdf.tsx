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
        width: 110,
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
    col1: { width: '60%' },
    col2: { width: '20%', textAlign: 'right' },
    col3: { width: '20%', textAlign: 'right' },
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
        width: 60,
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

export const RefundVoucherPDF = ({ voucher }: { voucher: VoucherType }) => {
    const person = voucher.voucher_items.find(
        (i) => i.business_partner,
    )?.business_partner;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>REFUND VOUCHER</Text>
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
                        <Text style={styles.label}>Refunded To:</Text>
                        <Text style={styles.value}>{person?.name || '-'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Reference:</Text>
                        <Text style={styles.value}>
                            {voucher.voucher_items.find((i) => i.remarks)
                                ?.remarks || '-'}
                        </Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Account</Text>
                        <Text style={styles.col2}>Debit</Text>
                        <Text style={styles.col3}>Credit</Text>
                    </View>
                    {voucher.voucher_items.map((item) => (
                        <View key={item.id} style={styles.tableRow}>
                            <Text style={styles.col1}>
                                {item.account?.name ||
                                    item.business_partner?.name}
                            </Text>
                            <Text style={styles.col2}>
                                {item.type.value === 'debit'
                                    ? item.amount
                                    : ''}
                            </Text>
                            <Text style={styles.col3}>
                                {item.type.value === 'credit'
                                    ? item.amount
                                    : ''}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.total}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>
                        {voucher.total_amount}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Remark/Reason:</Text>
                    <Text style={styles.value}>
                        {voucher.description || '-'}
                    </Text>
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
