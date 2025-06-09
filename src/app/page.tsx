// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Container, Typography, Button, List, ListItem, ListItemText } from '@mui/material'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: number
  name: string
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((rows) =>
        setProjects(
          rows.map((r) => ({
            id: r.id,
            name: r.name
          }))
        )
      )
  }, [])

  const addProject = async () => {
    const name = `Projekt ${projects.length + 1}`
    const defaultData = {
      supply: [0, 0],
      demand: [0, 0, 0],
      buyPrice: [0, 0],
      sellPrice: [0, 0, 0],
      cost: [
        [0, 0, 0],
        [0, 0, 0]
      ]
    }

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data: defaultData })
    })
    const p = await res.json()
    setProjects((prev) => [...prev, { id: p.id, name: p.name }])
    router.push(`/projects/${p.id}`)
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Wybierz projekt
      </Typography>

      <List>
        {projects.map((project) => (
          <ListItem
            key={project.id}
            component={Link}
            href={`/projects/${project.id}`}
          >
            <ListItemText primary={project.name} />
          </ListItem>
        ))}
      </List>

      <Button variant="contained" sx={{ mt: 2 }} onClick={addProject}>
        Utwórz nowy projekt
      </Button>
    </Container>
  )
}
