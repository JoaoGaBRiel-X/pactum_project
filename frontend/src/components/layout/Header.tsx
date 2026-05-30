export function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8 ml-64">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium text-slate-800">Tenant Atual: Franqueado SP</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
          AD
        </div>
      </div>
    </header>
  );
}
