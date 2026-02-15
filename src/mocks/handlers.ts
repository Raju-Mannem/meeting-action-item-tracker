import { graphql, HttpResponse } from 'msw'

export const handlers = [
    graphql.query('GetWorkspaces', ({ variables }) => {
        return HttpResponse.json({
            data: {
                workspaces: [
                    { id: '1', name: 'Mock Workspace 1', createdAt: '2023-01-01T00:00:00Z' },
                    { id: '2', name: 'Mock Workspace 2', createdAt: '2023-01-02T00:00:00Z' },
                ],
            },
        })
    }),

    graphql.mutation('DeleteWorkspace', ({ variables }) => {
        return HttpResponse.json({
            data: {
                deleteWorkspace: true,
            },
        })
    }),

    graphql.mutation('UpdateWorkspace', ({ variables }) => {
        return HttpResponse.json({
            data: {
                updateWorkspace: {
                    id: variables.input.id,
                    name: variables.input.name,
                },
            },
        })
    }),

    graphql.mutation('CreateWorkspace', ({ variables }) => {
        return HttpResponse.json({
            data: {
                createWorkspace: {
                    id: 'new-id',
                    name: variables.input.name,
                    createdAt: new Date().toISOString()
                }
            }
        })
    })
]
