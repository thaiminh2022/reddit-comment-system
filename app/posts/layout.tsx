export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-1/2 mx-auto mt-20">{children}</div>;
}
