// C:\Users\User\Desktop\Fabio\Mentoria\Nextjs-todo-list\Nextjs\todo-list\app\layout.jsx
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
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