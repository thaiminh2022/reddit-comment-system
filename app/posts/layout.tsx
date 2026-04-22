import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-3/4 lg:w-1/2 mx-auto mt-20">{children}</div>;
}
