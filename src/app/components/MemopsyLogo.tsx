import Image from "next/image";

export default function MemopsyLogo() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/memopsy-logo.png"
        alt="MEMOPSY Logo"
        width={180}
        height={180}
        className="rounded-lg"
      />
    </div>
  );
}