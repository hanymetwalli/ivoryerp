import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { hasPermission } from "@/components/permissions";

export default function PermissionButton({ permission, children, fallback = null, ...props }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log("User not authenticated");
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) return null;

  if (!hasPermission(user, permission)) {
    return fallback;
  }

  return React.cloneElement(children, props);
}