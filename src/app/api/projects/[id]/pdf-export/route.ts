// /app/api/projects/[id]/pdf-export/route.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InputData } from '../../../../../components/InputTable';
import { PlanItem } from '../../../../../components/ResultsTable';

// Rozszerzenie typu jsPDF o autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface ExportData {
  projectName: string;
  inputData: InputData;
  unitProfits: number[][];
  plan: PlanItem[];
  totalProfit: number;
}
 
export const usePDFExport = () => {
  const exportToPDF = (data: ExportData) => {
    const doc = new jsPDF();
    
    // Ustawienia dokumentu
    doc.setFont('Helvetica');
    doc.setFontSize(16);
    doc.text('Raport Optymalizacji Transportu', 20, 20);
    
    // Nazwa projektu
    doc.setFontSize(12);
    doc.text(`Projekt: ${data.projectName}`, 20, 35);
    
    let yPosition = 50;
    
    // 1. Tabela danych wejściowych
    doc.setFontSize(14);
    doc.text('Dane wejsciowe', 20, yPosition);
    yPosition += 10;
    
    // Nagłówki dla tabeli danych wejściowych
    const inputHeaders = ['Zakup / Sprzedaz'];
    data.inputData.sellPrice.forEach((_, j) => {
      inputHeaders.push(`O${j + 1} (${data.inputData.sellPrice[j]})`);
    });
    inputHeaders.push('Podaz');
    
    // Dane dla tabeli wejściowej
    const inputTableData: (string | number)[][] = [];
    
    data.inputData.buyPrice.forEach((buyPrice, i) => {
      const row: (string | number)[] = [`D${i + 1} (${buyPrice})`];
      data.inputData.cost[i].forEach(cost => {
        row.push(cost);
      });
      row.push(data.inputData.supply[i]);
      inputTableData.push(row);
    });
    
    // Wiersz popytu
    const demandRow: (string | number)[] = ['Popyt'];
    data.inputData.demand.forEach(demand => {
      demandRow.push(demand);
    });
    demandRow.push('');
    inputTableData.push(demandRow);
    
    autoTable(doc, {
      startY: yPosition,
      head: [inputHeaders],
      body: inputTableData,
      theme: 'grid',
      styles: { 
        fontSize: 9,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [70, 130, 180],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 20;
    
    // 2. Tabela Zysków Jednostkowych
    doc.setFontSize(14);
    doc.text('Zyski Jednostkowe', 20, yPosition);
    yPosition += 10;
    
    // Nagłówki dla zysków jednostkowych
    const profitHeaders: string[] = [];
    if (data.unitProfits[0]) {
      data.unitProfits[0].forEach((_, j) => {
        profitHeaders.push(`O${j + 1}`);
      });
    }
    
    // Dane dla zysków jednostkowych
    const profitTableData: string[][] = [];
    data.unitProfits.forEach((row, i) => {
      const tableRow: string[] = [];
      row.forEach(profit => {
        tableRow.push(profit.toFixed(2));
      });
      profitTableData.push(tableRow);
    });
    
    autoTable(doc, {
      startY: yPosition,
      head: [profitHeaders],
      body: profitTableData,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        halign: 'center'
      },
      headStyles: {
        fillColor: [34, 139, 34],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 20;
    
    // 3. Plan Transportu
    doc.setFontSize(14);
    doc.text('Plan Transportu', 20, yPosition);
    yPosition += 10;
    
    const transportTableData: (string | number)[][] = [];
    data.plan.forEach(item => {
      transportTableData.push([
        `D${item.i + 1}`,
        `O${item.j + 1}`,
        item.qty
      ]);
    });
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Dostawca', 'Odbiorca', 'Ilosc']],
      body: transportTableData,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        halign: 'center'
      },
      headStyles: {
        fillColor: [220, 20, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    yPosition = doc.lastAutoTable.finalY + 15;
    
    // Łączny zysk
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text(`Laczny zysk: ${data.totalProfit.toFixed(2)}`, 20, yPosition);
    
    // Dodanie daty generowania
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Wygenerowano: ${new Date().toLocaleString('pl-PL')}`, 20, yPosition);
    
    // Zapisanie pliku
    const fileName = `transport-optimization-${data.projectName}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };
  
  return { exportToPDF };
};

// Hook do przygotowania danych do eksportu
export const usePrepareExportData = () => {
  const prepareData = (
    projectName: string,
    inputData: InputData,
    unitProfits: number[][],
    plan: PlanItem[],
    totalProfit: number
  ): ExportData => {
    return {
      projectName,
      inputData,
      unitProfits,
      plan,
      totalProfit
    };
  };
  
  return { prepareData };
};