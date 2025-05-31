'use client'

import React, { useState } from 'react'
import { Button, CircularProgress, Box } from '@mui/material'
import { PictureAsPdf as PdfIcon } from '@mui/icons-material'
import { usePDFExport, usePrepareExportData } from '../app/api/projects/[id]/pdf-export/route'
import { InputData } from '../components/InputTable'
import { PlanItem } from '../components/ResultsTable'

interface Props {
  projectName: string
  inputData: InputData
  unitProfits: number[][]
  plan: PlanItem[]
  totalProfit: number
  disabled?: boolean
}

export default function ExportButton({
  projectName,
  inputData,
  unitProfits,  
  plan,
  totalProfit,
  disabled = false
}: Props) {
  const [isExporting, setIsExporting] = useState(false)
  const { exportToPDF } = usePDFExport()
  const { prepareData } = usePrepareExportData()

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const exportData = prepareData(
        projectName,
        inputData,
        unitProfits,
        plan,
        totalProfit
      )
      
      // Małe opóźnienie dla UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      exportToPDF(exportData)
    } catch (error) {
      console.error('Błąd podczas eksportu:', error)
      // Tutaj możesz dodać toast/snackbar z błędem
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={
        isExporting ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <PdfIcon />
        )
      }
      onClick={handleExport}
      disabled={disabled || isExporting || plan.length === 0}
      sx={{
        minWidth: 160,
        height: 40
      }}
    >
      {isExporting ? 'Eksportowanie...' : 'Eksportuj PDF'}
    </Button>
  )
}