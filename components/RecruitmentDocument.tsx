"use client";
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { RecruitmentData } from './types';

// フォント登録 (publicフォルダのパスを指定)
Font.register({
  family: 'NotoSansJP',
  src: '/fonts/NotoSansJP-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    padding: 30,
    fontSize: 10,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  // テーブル用スタイル
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  // 稟議書の承認印欄
  stampBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  stampBox: {
    width: 60,
    height: 60,
    border: '1px solid #000',
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stampTitle: {
    fontSize: 8,
    borderBottom: '1px solid #000',
    width: '100%',
    textAlign: 'center',
    padding: 2,
  },
});

// 金額フォーマット用ユーティリティ
const fmt = (num: number) => new Intl.NumberFormat('ja-JP').format(num);

interface Props {
  data: RecruitmentData;
}

export const RecruitmentDocument: React.FC<Props> = ({ data }) => {
  return (
    <Document>
      {/* 1ページ目: 採用通知書 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text>{data.notification.issueDate}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text>{data.candidate.name} 様</Text>
          <View>
             <Text>株式会社ボンズ・ジャパン</Text>
             <Text>代表取締役 {data.notification.companyRep} 金澤 淳</Text>
          </View>
        </View>

        <Text style={styles.title}>採用通知書</Text>

        <Text style={{ marginBottom: 10 }}>
          貴殿を以下の条件にて採用いたします。
          なお、本通知書に定めのない労働条件については、就業規則、給与規定によるものとします。
        </Text>

        <Text style={{ textAlign: 'center', marginBottom: 10 }}>記</Text>

        {/* 条件テーブル (簡易版) */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%', backgroundColor: '#f0f0f0' }}>
              <Text style={styles.tableCell}>入社予定日</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>{data.employment.joiningDate}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%', backgroundColor: '#f0f0f0' }}>
              <Text style={styles.tableCell}>所属・役職</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>{data.employment.department} / {data.employment.position}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%', backgroundColor: '#f0f0f0' }}>
              <Text style={styles.tableCell}>月額給与(本採用時)</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>{fmt(data.salary.official.totalMonthly)}円 (基本給: {fmt(data.salary.official.basic)}円 + 諸手当)</Text>
            </View>
          </View>
           <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%', backgroundColor: '#f0f0f0' }}>
              <Text style={styles.tableCell}>通勤手当</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>{data.salary.official.commutingAllowance}</Text>
            </View>
          </View>
        </View>

        <Text style={{ marginTop: 20 }}>以上</Text>
      </Page>

      {/* 2ページ目: 採用稟議書 */}
      <Page size="A4" style={styles.page}>
         <Text style={{ textAlign: 'right', fontSize: 9 }}>別表2(第3条関係)</Text>
         <Text style={styles.title}>稟議書</Text>

        <View style={styles.headerRow}>
          <View>
            <Text>起案日: {data.approvalRequest.applicationDate}</Text>
            <Text>起案者: {data.approvalRequest.applicantName}</Text>
            <Text>件名: {data.candidate.name}氏 採用の件</Text>
          </View>
          
          {/* ハンコ枠 (印刷用空欄) */}
          <View style={styles.stampBoxContainer}>
            <View style={styles.stampBox}><Text style={styles.stampTitle}>社長</Text></View>
            <View style={styles.stampBox}><Text style={styles.stampTitle}>部長</Text></View>
            <View style={styles.stampBox}><Text style={styles.stampTitle}>課長</Text></View>
            <View style={styles.stampBox}><Text style={styles.stampTitle}>起案</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{marginBottom: 5}}>下記の内容で採用を行いたく、ご承認をお願いいたします。</Text>
        </View>

        {/* 稟議詳細テーブル */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
             <View style={{...styles.tableCol, width: '20%', backgroundColor: '#eee'}}>
               <Text style={styles.tableCell}>氏名</Text>
             </View>
             <View style={{...styles.tableCol, width: '80%'}}>
               <Text style={styles.tableCell}>{data.candidate.name} ({data.candidate.furigana})</Text>
             </View>
          </View>
          <View style={styles.tableRow}>
             <View style={{...styles.tableCol, width: '20%', backgroundColor: '#eee'}}>
               <Text style={styles.tableCell}>応募経路</Text>
             </View>
             <View style={{...styles.tableCol, width: '80%'}}>
               <Text style={styles.tableCell}>{data.approvalRequest.recruitmentRoute}</Text>
             </View>
          </View>
           <View style={styles.tableRow}>
             <View style={{...styles.tableCol, width: '20%', backgroundColor: '#eee'}}>
               <Text style={styles.tableCell}>面接官</Text>
             </View>
             <View style={{...styles.tableCol, width: '80%'}}>
               <Text style={styles.tableCell}>{data.approvalRequest.interviewers.join('・')}</Text>
             </View>
          </View>
        </View>

        <Text style={{marginTop: 10, marginBottom: 5, fontWeight: 'bold'}}>【給与条件】</Text>
        <View style={styles.table}>
           <View style={{...styles.tableRow, backgroundColor: '#eee'}}>
             <View style={{...styles.tableCol, width: '34%'}}><Text style={styles.tableCell}>項目</Text></View>
             <View style={{...styles.tableCol, width: '33%'}}><Text style={styles.tableCell}>試用期間中</Text></View>
             <View style={{...styles.tableCol, width: '33%'}}><Text style={styles.tableCell}>本採用後</Text></View>
           </View>
           
           <View style={styles.tableRow}>
             <View style={{...styles.tableCol, width: '34%'}}><Text style={styles.tableCell}>基本給</Text></View>
             <View style={{...styles.tableCol, width: '33%'}}><Text style={styles.tableCell}>{fmt(data.salary.probation.basic)}</Text></View>
             <View style={{...styles.tableCol, width: '33%'}}><Text style={styles.tableCell}>{fmt(data.salary.official.basic)}</Text></View>
           </View>

           {/* 手当の行（簡略化のため固定で表示していますが、map等で展開も可） */}
           <View style={styles.tableRow}>
             <View style={{...styles.tableCol, width: '34%'}}><Text style={styles.tableCell}>月額合計</Text></View>
             <View style={{...styles.tableCol, width: '33%'}}><Text style={styles.tableCell}>{fmt(data.salary.probation.totalMonthly)}</Text></View>
             <View style={{...styles.tableCol, width: '33%'}}><Text style={styles.tableCell}>{fmt(data.salary.official.totalMonthly)}</Text></View>
           </View>
        </View>

        <View style={{ marginTop: 10 }}>
           <Text>理論年収: {fmt(data.salary.annualIncome)}円</Text>
           <Text>採用コスト(Fee): {fmt(data.approvalRequest.recruitmentFee)}円</Text>
           <Text>備考: {data.approvalRequest.notes}</Text>
        </View>

      </Page>
    </Document>
  );
};