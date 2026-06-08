import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                    <span className="text-2xl font-bold cursor-pointer">Breezy</span>
                </Link>

                <Link href="/tweet/create">
                    <span className="text-xl font-bold cursor-pointer">Ecrire un tweet</span>
                </Link>
            </div>
        </nav>
    );
}