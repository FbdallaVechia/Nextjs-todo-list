import './App.css'; // Importa o CSS global
import 'bootstrap/dist/css/bootstrap.min.css';

export const metadata = {
  title: 'To-Do List',
  description: 'Minhas tarefas com Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
