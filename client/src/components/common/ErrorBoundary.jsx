import React from 'react';
import { Button } from './UI';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <main className="grid min-h-screen place-items-center p-6">
          <div className="glass max-w-md rounded-3xl p-8 text-center">
            <h1 className="text-2xl font-semibold">Có điều gì đó chưa ổn</h1>
            <p className="my-4 text-zinc-400">Hãy tải lại trang để tiếp tục.</p>
            <Button onClick={() => location.reload()}>Tải lại</Button>
          </div>
        </main>
      );
    return this.props.children;
  }
}
