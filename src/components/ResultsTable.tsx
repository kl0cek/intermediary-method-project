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

export interface PlanItem {
  i: number
  j: number
  qty: number
}

interface Props {
  plan: PlanItem[]
  totalProfit: number
}

export default function ResultsTable({ plan, totalProfit }: Props) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Plan Transportu
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Dostawca</TableCell>
            <TableCell>Odbiorca</TableCell>
            <TableCell>Ilość</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plan.map((r, idx) => (
            <TableRow key={idx}>
              <TableCell>{r.i + 1}</TableCell>
              <TableCell>{r.j + 1}</TableCell>
              <TableCell>{r.qty}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2}>
              <Typography fontWeight="bold">Łączny zysk</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight="bold">
                {totalProfit.toFixed(2)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  )
}