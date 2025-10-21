import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import * as Route from 'react-router';
import './app.css';
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";
import { NotificationProvider, useNotification } from './components/NotificationContext';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

type NotificationType = "success" | "error" | "warning" | "info";

function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-green-500/90 border-green-400";
      case "error":
        return "bg-red-500/90 border-red-400";
      case "warning":
        return "bg-yellow-500/90 border-yellow-400";
      case "info":
        return "bg-blue-500/90 border-blue-400";
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="size-5" />;
      case "error":
        return <AlertCircle className="size-5" />;
      case "warning":
        return <AlertCircle className="size-5" />;
      case "info":
        return <Info className="size-5" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${getNotificationStyles(notif.type)} backdrop-blur-xl border-2 rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300`}
        >
          <div className="text-white">
            {getNotificationIcon(notif.type)}
          </div>
          <p className="text-white font-medium flex-1">{notif.message}</p>
          <button
            onClick={() => removeNotification(notif.id)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NotificationProvider>
          <NotificationContainer />
          {children}
        </NotificationProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}

export function HydrateFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Loading Snake Game...</p>
      </div>
    </div>
  );
}

