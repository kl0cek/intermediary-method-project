// app/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  Divider
} from '@mui/material'

// Poprawne ścieżki importu – patrz tsconfig.json (baseUrl: ".", paths: { "@/*": ["*"] })
import InputTable, { InputData } from '../components/InputTable'
import ProfitTable from '../components/ProfitTable'
import ResultsTable from '../components/ResultsTable'

interface Project {
  id: number
  name: string
  input: InputData
  result?: any
}

export default function Home() {
  // Domyślne dane: 2 dostawców, 3 odbiorców
  const defaultData: InputData = {
    supply: [20, 30],
    demand: [10, 28, 27],
    buyPrice: [10, 12],
    sellPrice: [30, 25, 30],
    cost: [
      [8, 14, 17],
      [12, 9, 19]
    ]
  }

  const [projects, setProjects] = useState<Project[]>([])

  // 1) Pobierz istniejące projekty z bazy
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((rows: any[]) =>
        setProjects(
          rows.map((r) => ({
            id: r.id,
            name: r.name,
            input: JSON.parse(r.input),
            result: r.result ? JSON.parse(r.result) : undefined
          }))
        )
      )
  }, [])

  // 2) Dodaj nowy projekt
  const addProject = async () => {
    const name = `Projekt ${projects.length + 1}`
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data: defaultData })
    })
    const p = await res.json()
    setProjects((ps) => [...ps, { id: p.id, name: p.name, input: defaultData }])
  }

  // 3) Aktualizuj nazwę lub dane wejściowe
  const updateProject = async (
    id: number,
    field: 'name' | 'data',
    value: any
  ) => {
    const body: any = {}
    if (field === 'name') body.name = value
    else body.data = value

    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    setProjects((ps) =>
      ps.map((p) =>
        p.id === id
          ? field === 'name'
            ? { ...p, name: value }
            : { ...p, input: value }
          : p
      )
    )
  }

  // 4) Usuń projekt
  const deleteProject = async (id: number) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects((ps) => ps.filter((p) => p.id !== id))
  }

  // 5) Wywołaj POST /api/solve i zapisz wynik
  const solveProject = async (id: number, data: InputData) => {
    const res = await fetch('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id, ...data })
    })
    const result = await res.json()
    // przechowaj input i wynik
    await updateProject(id, 'data', data)
    setProjects((ps) =>
      ps.map((p) => (p.id === id ? { ...p, result } : p))
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Zagadnienie Pośrednika — Projekty
      </Typography>

      <Button variant="contained" onClick={addProject} sx={{ mb: 2 }}>
        Dodaj projekt
      </Button>

      {projects.map((p) => (
        <Paper key={p.id} sx={{ p: 2, mb: 3 }}>
          <TextField
            label="Nazwa projektu"
            value={p.name}
            onChange={(e) => updateProject(p.id, 'name', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            color="error"
            onClick={() => deleteProject(p.id)}
            sx={{ mb: 2 }}
          >
            Usuń
          </Button>

          {/* <-- Tutaj powinna się wyświetlić tabela */}
          <InputTable
            data={p.input}
            setData={(d) => updateProject(p.id, 'data', d)}
          />

          <Divider sx={{ my: 2 }} />

          <Button
            variant="contained"
            onClick={() => solveProject(p.id, p.input)}
          >
            Rozwiąż
          </Button>

          {p.result && (
            <>
              <ProfitTable unitProfits={p.result.unitProfits} />
              <ResultsTable
                plan={p.result.plan}
                totalProfit={p.result.totalProfit}
              />
            </>
          )}
        </Paper>
      ))}
    </Container>
  )
}