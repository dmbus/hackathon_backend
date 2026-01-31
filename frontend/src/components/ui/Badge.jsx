
const Badge = ({ children, color = 'indigo' }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        rose: 'bg-rose-50 text-rose-600',
        emerald: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
        slate: 'bg-slate-100 text-slate-600',
        blue: 'bg-blue-50 text-blue-600',
        violet: 'bg-violet-50 text-violet-700',
    };
    return (
        <span className={`${colors[color] || colors.indigo} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
            {children}
        </span>
    );
};

export default Badge;
