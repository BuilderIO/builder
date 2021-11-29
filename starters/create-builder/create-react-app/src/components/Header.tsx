export interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header(props: HeaderProps) {
  return (
    <div className="Header">
      <header>{props.title}</header>
      <footer>{props.subtitle}</footer>
    </div>
  );
}
