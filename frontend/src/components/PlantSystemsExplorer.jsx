import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Layers, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PlantSystemsExplorer({
  subsystems,
  selectedNodeId,
  onSelectNode,
  searchQuery,
  onSearchChange,
  isCollapsed,
  onToggleCollapse
}) {
  const [expandedSubsystems, setExpandedSubsystems] = useState({
    'sub-1': true,
    'sub-2': true,
    'sub-3': true,
    'sub-4': true,
    'sub-5': true,
    'sub-6': true
  });

  const toggleSub = (id) => {
    setExpandedSubsystems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalNodesCount = subsystems.reduce((acc, sub) => acc + (sub.nodes ? sub.nodes.length : 0), 0);

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-14' : 'w-80 md:w-88'
      } flex-shrink-0 z-20 overflow-hidden shadow-sm`}
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              Plant Systems Explorer
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-200">
              {totalNodesCount} Nodes
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? "Expand Explorer" : "Collapse Explorer"}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search tags, KKS, subsystems..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Subsystems & Nodes Tree */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {subsystems.map((sub) => {
              const isExpanded = expandedSubsystems[sub.id];
              // Filter nodes if search query exists
              const filteredNodes = sub.nodes.filter((node) => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                  node.name.toLowerCase().includes(q) ||
                  node.kks_tag.toLowerCase().includes(q) ||
                  node.category.toLowerCase().includes(q)
                );
              });

              if (searchQuery && filteredNodes.length === 0) return null;

              return (
                <div key={sub.id} className="text-xs">
                  {/* Subsystem Group Header */}
                  <button
                    onClick={() => toggleSub(sub.id)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 group-hover:scale-125 transition-transform"></span>
                      <span className="font-bold text-[11px] text-slate-700 tracking-tight uppercase">
                        {sub.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-400">
                      <span className="text-[10px] font-mono">({filteredNodes.length})</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {/* Nodes list */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-50">
                      {filteredNodes.map((node) => {
                        const isSelected = selectedNodeId === node.id;
                        return (
                          <div
                            key={node.id}
                            onClick={() => onSelectNode(node.id)}
                            className={`px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-sky-500 text-white font-medium'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                  {node.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                                  isSelected 
                                    ? 'bg-sky-600/70 border-sky-400 text-sky-100' 
                                    : 'bg-slate-100 border-slate-200 text-slate-500'
                                }`}>
                                  {node.short_kks}
                                </span>
                                <span className={`text-[10px] truncate ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                                  {node.primary_metric_name}
                                </span>
                              </div>
                            </div>

                            {/* Value Badge */}
                            <div className="flex-shrink-0 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-tight ${
                                isSelected
                                  ? 'bg-white text-sky-700 shadow-xs'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {typeof node.primary_metric_value === 'number'
                                  ? node.primary_metric_value.toLocaleString()
                                  : node.primary_metric_value}{' '}
                                <span className="text-[9px] font-normal">{node.primary_metric_unit}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* When Collapsed: Vertical icon strip */}
      {isCollapsed && (
        <div className="p-2 space-y-3 flex flex-col items-center">
          {subsystems.map((sub, i) => (
            <button
              key={sub.id}
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-sky-100 hover:text-sky-600 flex items-center justify-center text-xs font-bold text-slate-600 transition-colors"
              title={sub.name}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

