'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

interface Props {
  unitProfits: number[][]
}

export default function ProfitTable({ unitProfits }: Props) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Zyski Jednostkowe
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            {unitProfits[0]?.map((_, j) => (
              <TableCell key={j}>O{j + 1}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {unitProfits.map((row, i) => (
            <TableRow key={i}>
              {row.map((p, j) => (
                <TableCell key={j}>{p.toFixed(2)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}