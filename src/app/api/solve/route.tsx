// File: app/api/solve/route.ts

import { NextResponse } from 'next/server'
import Solver from 'javascript-lp-solver'
import db from '../../../lib/db'

export interface SolveRequest {
  projectId: number
  supply: number[]
  demand: number[]
  buyPrice: number[]
  sellPrice: number[]
  cost: number[][]
}

export interface PlanItem {
  i: number
  j: number
  qty: number
}

export interface SolveResult {
  unitProfits: number[][]
  plan: PlanItem[]
  totalProfit: number
}

export async function POST(request: Request) {
  const {
    projectId,
    supply: origSupply,
    demand: origDemand,
    buyPrice: origBuy,
    sellPrice: origSell,
    cost: origCost
  }: SolveRequest = await request.json()

  // Skopiujemy dane wejściowe żeby nie nadpisać oryginałów
  const supply = [...origSupply]
  const demand = [...origDemand]
  const buyPrice = [...origBuy]
  const sellPrice = [...origSell]
  const cost = origCost.map(row => [...row])

  // Zbalansujmy problem (dodajemy fikcyjny wiersz/kolumnę, jeśli trzeba)
  const totalSupply = supply.reduce((sum, x) => sum + x, 0)
  const totalDemand = demand.reduce((sum, x) => sum + x, 0)

  if (totalSupply > totalDemand) {
    demand.push(totalSupply - totalDemand)
    sellPrice.push(0)
    cost.forEach(row => row.push(0))
  } else if (totalDemand > totalSupply) {
    supply.push(totalDemand - totalSupply)
    buyPrice.push(0)
    cost.push(Array(origDemand.length).fill(0))
  }

  const m = supply.length
  const n = demand.length

  // Budujemy model LP
  const model: any = {
    optimize: 'profit',
    opType: 'max',
    constraints: {},
    variables: {}
  }

  // ograniczenia podaży: Σ_j x_ij ≤ supply[i]
  supply.forEach((s, i) => {
    model.constraints[`s${i}`] = { max: s }
  })

  // ograniczenia popytu: Σ_i x_ij ≥ demand[j]
  demand.forEach((d, j) => {
    model.constraints[`d${j}`] = { min: d }
  })

  // zmienne x_i_j z funkcją celu profit = sellPrice[j] - buyPrice[i] - cost[i][j]
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const varName = `x_${i}_${j}`
      const unitProfit = sellPrice[j] - buyPrice[i] - cost[i][j]
      model.variables[varName] = {
        profit: unitProfit,
        [`s${i}`]: 1,
        [`d${j}`]: 1
      }
    }
  }

  // Rozwiązujemy
  const sol = Solver.Solve(model)

  // Parsujemy plan transportu
  const plan: PlanItem[] = []
  for (const [key, value] of Object.entries(sol)) {
    if (key.startsWith('x_') && typeof value === 'number' && value > 0) {
      const [, si, sj] = key.split('_')
      plan.push({ i: +si, j: +sj, qty: value })
    }
  }

  // Macierz zysków jednostkowych
  const unitProfits = Array(m)
    .fill(0)
    .map((_, i) =>
      Array(n)
        .fill(0)
        .map((_, j) => sellPrice[j] - buyPrice[i] - cost[i][j])
    )

  const result: SolveResult = {
    unitProfits,
    plan,
    totalProfit: sol.result as number
  }

  // Zapisujemy wynik w bazie dla danego projektu
  db.run(
    'UPDATE projects SET result = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    JSON.stringify(result),
    projectId,
    (err : any) => {
      if (err) console.error('Błąd zapisu wyniku:', err)
    }
  )

  return NextResponse.json(result)
}