
interface NavigatableBarProps {
    gene: string;
    species: string;
    enh: boolean;
    prom: boolean;
    TFBS: string[];
    variants: string[];
}

export default function NavigatableBar({gene, species, enh, prom, TFBS, variants}: NavigatableBarProps) {
    return (
        <div className="container-box">
            
        </div>
    );
}