
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "rounded-full font-bold px-8 py-4 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 cursor-pointer";
    const variants = {
        primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5",
        secondary: "bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 hover:border-indigo-100 hover:shadow-md",
        outline: "border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50",
        ghost: "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 px-4 py-2"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
