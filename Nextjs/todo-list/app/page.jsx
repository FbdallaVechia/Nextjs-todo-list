// app/page.jsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/todos'); // Redireciona para a sua lista de tarefas
}