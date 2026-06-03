import Image from "next/image";

type BrandLogoProps = {
    showText?: boolean;
    textClassName?: string;
    markClassName?: string;
    className?: string;
};

export default function BrandLogo({
    showText = true,
    textClassName = "text-xl font-bold tracking-tight text-text-primary",
    markClassName = "w-10 h-10",
    className = "flex items-center gap-2",
}: BrandLogoProps) {
    return (
        <div className={className}>
            <div className={`${markClassName} relative shrink-0 overflow-hidden rounded-xl bg-white shadow-sm`}>
                <Image
                    src="/images/ihds-logo.png"
                    alt="IHDS logo"
                    fill
                    sizes="48px"
                    className="object-contain"
                    priority
                />
            </div>
            {showText && (
                <span className={textClassName}>
                    IH<span className="gradient-text">DS</span>
                </span>
            )}
        </div>
    );
}
