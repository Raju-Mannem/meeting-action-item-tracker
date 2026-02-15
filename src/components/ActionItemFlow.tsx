'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Connection,
    MarkerType,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import clsx from 'clsx';
import { CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';

const ActionNode = ({ id, data }: any) => {

    const [label, setLabel] = useState(data.label);

    useEffect(() => {
        setLabel(data.label);
    }, [data.label]);

    const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
    };

    const commitChange = () => {
        if (label !== data.label) {
            data.onChange(id, label);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <div className={clsx(
            "min-w-[300px] max-w-[500px] p-3 rounded-lg border bg-white dark:bg-zinc-900 shadow-sm",
            data.status === 'DONE'
                ? "border-green-500 bg-green-50/50"
                : "border-zinc-300 dark:border-zinc-700"
        )}>
            <div className="flex items-center gap-2 mb-2">
                <button onClick={data.onToggle}>
                    {data.status === 'DONE'
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <Circle className="w-4 h-4" />}
                </button>
                <div className="text-xs font-bold text-zinc-500 uppercase">
                    {data.owner || 'Action'}
                </div>
            </div>

            <input
                value={label}
                onChange={onLabelChange}
                onBlur={commitChange}
                onKeyDown={handleKeyDown}
                className="w-full text-sm bg-transparent outline-none"
            />

            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

const nodeTypes = {
    actionItem: ActionNode,
};

interface ActionItem {
    id: string;
    task: string;
    status: 'OPEN' | 'DONE';
    owner?: string;
    dependsOn?: string[];
}

interface Props {
    items: ActionItem[];
    onToggleStatus: (id: string, status: 'OPEN' | 'DONE') => void;
    onUpdateItem?: (id: string, updates: { task?: string }) => void;
}

export default function ActionItemFlow({ items, onToggleStatus, onUpdateItem }: Props) {

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    useEffect(() => {

        const initialNodes: Node[] = items.map((item, index) => ({
            id: item.id,
            type: 'actionItem',
            position: { x: 250, y: index * 120 },
            data: {
                label: item.task,
                status: item.status,
                owner: item.owner,
                onToggle: () => onToggleStatus(item.id, item.status),
                onChange: (id: string, newLabel: string) => {
                    if (onUpdateItem) {
                        onUpdateItem(id, { task: newLabel });
                    }
                },
            },
        }));

        const initialEdges: Edge[] = items
  .slice(1)
  .map((item, index) => ({
    id: `e-${items[index].id}-${item.id}`,
    source: items[index].id,
    target: item.id,
    markerEnd: { type: MarkerType.ArrowClosed },
    animated: true,
  }));

        setNodes(initialNodes);
        setEdges(initialEdges);

    }, [items]);

    const handleLabelChange = useCallback((id: string, newLabel: string) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, label: newLabel } }
                    : node
            )
        );
    }, []);

    const onConnect = useCallback(
        (params: Connection) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        markerEnd: { type: MarkerType.ArrowClosed },
                        animated: true,
                    },
                    eds
                )
            ),
        []
    );

    const addNewNode = () => {
        const id = crypto.randomUUID();

        const newNode: Node = {
            id,
            type: 'actionItem',
            position: { x: 100, y: 100 },
            data: {
                label: 'New Task',
                status: 'OPEN',
                owner: 'You',
                onToggle: () => {},
                onChange: handleLabelChange,
            },
        };

        setNodes((nds) => [...nds, newNode]);
        toast.success("New Action Item added");
    };

    return (
        <div className="w-full h-[600px] bg-zinc-50 dark:bg-zinc-950">

            <div className="p-2">
                <button
                    onClick={addNewNode}
                    className="px-3 py-1 text-sm bg-red-500/80 text-white rounded"
                >
                    + Add Node
                </button>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                deleteKeyCode={['Backspace', 'Delete']}
                proOptions={{ hideAttribution: true }}
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}
