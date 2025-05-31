// app/projects/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Typography,
  TextField,
  Button,
  Divider,
  Box,
  Paper
} from '@mui/material'
import InputTable from '../../../components/InputTable'
import ProfitTable from '../../../components/ProfitTable'
import ResultsTable from '../../../components/ResultsTable'
import ExportButton from '@/components/ExportButton'

export default function ProjectPage() {
  const router = useRouter()
  const { id } = useParams()
  const projectId = Number(id)
  const [name, setName] = useState('')
  const [input, setInput] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name)
        setInput(JSON.parse(data.input))
        if (data.result) setResult(JSON.parse(data.result))
      })
  }, [projectId])

  const updateProject = async (field: 'name' | 'data', value: any) => {
    const body: any = {}
    if (field === 'name') body.name = value
    else body.data = value

    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (field === 'name') setName(value)
    else setInput(value)
  } 

  const deleteProject = async () => {
    if(!confirm('Czy na penwo chcesz usunac projekt?')) return;

    try{
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE'})
      router.push('/')
    } catch (err){
      console.error(err)
      alert('Nie udalo sie usunac')
    }
  }

  const solve = async () => {
    const res = await fetch('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, ...input })
    })
    const result = await res.json()
    await updateProject('data', input)
    setResult(result)
  }

  if (!input) return <div>Ładowanie...</div>

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        <Button onClick={() => window.history.back()} sx={{mb:2}}>
          Strona Główna
        </Button>
      </Typography>
      <Typography variant="h5" gutterBottom>
        Projekt: {name}
      </Typography>

      <TextField
        label="Nazwa projektu"
        value={name}
        onChange={(e) => updateProject('name', e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Button
            color="error"
            onClick={() => deleteProject()}
            sx={{ mb: 2 }}
          >
            Usuń projekt
          </Button>

      <InputTable data={input} setData={(d) => updateProject('data', d)} />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={solve}>
          Rozwiąż
        </Button>
        
        {result && (
          <ExportButton
            projectName={name}
            inputData={input}
            unitProfits={result.unitProfits}
            plan={result.plan}
            totalProfit={result.totalProfit}
          />
        )}
      </Box>

      {result && (
        <>
          <ProfitTable unitProfits={result.unitProfits} />
          <ResultsTable
            plan={result.plan}
            totalProfit={result.totalProfit}
          />
        </>
      )}

    </Container>
  )
}
