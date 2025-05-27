'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField
} from '@mui/material'

export interface InputData {
  supply: number[]
  demand: number[]
  buyPrice: number[]
  sellPrice: number[]
  cost: number[][]
}

interface Props {
  data: InputData
  setData: (data: InputData) => void
}

export default function InputTable({ data, setData }: Props) {
  const { supply, demand, buyPrice, sellPrice, cost } = data

  const updateCell = (
    field: keyof InputData,
    i: number,
    j: number,
    raw: string
  ) => {
    const v = parseFloat(raw) || 0
    const copy: InputData = {
      supply: [...supply],
      demand: [...demand],
      buyPrice: [...buyPrice],
      sellPrice: [...sellPrice],
      cost: cost.map((r) => [...r])
    }

    switch (field) {
      case 'supply':
        copy.supply[i] = v
        break
      case 'demand':
        copy.demand[j] = v
        break
      case 'buyPrice':
        copy.buyPrice[i] = v
        break
      case 'sellPrice':
        copy.sellPrice[j] = v
        break
      case 'cost':
        copy.cost[i][j] = v
        break
    }
    setData(copy)
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Zakup ↓ / Sprzedaż →</TableCell>
          {demand.map((_, j) => (
            <TableCell key={j}>
              <TextField
                type="number"
                size="small"
                value={sellPrice[j]}
                onChange={(e) =>
                  updateCell('sellPrice', 0, j, e.target.value)
                }
              />
            </TableCell>
          ))}
          <TableCell>Podaż</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {supply.map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <TextField
                type="number"
                size="small"
                value={buyPrice[i]}
                onChange={(e) =>
                  updateCell('buyPrice', i, 0, e.target.value)
                }
              />
            </TableCell>
            {demand.map((_, j) => (
              <TableCell key={j}>
                <TextField
                  type="number"
                  size="small"
                  value={cost[i][j]}
                  onChange={(e) => updateCell('cost', i, j, e.target.value)}
                />
              </TableCell>
            ))}
            <TableCell>
              <TextField
                type="number"
                size="small"
                value={supply[i]}
                onChange={(e) => updateCell('supply', i, 0, e.target.value)}
              />
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell>Popyt</TableCell>
          {demand.map((d, j) => (
            <TableCell key={j}>
              <TextField
                type="number"
                size="small"
                value={d}
                onChange={(e) => updateCell('demand', 0, j, e.target.value)}
              />
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  )
}