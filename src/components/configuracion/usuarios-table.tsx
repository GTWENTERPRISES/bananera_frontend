"use client";

import { useState } from "react";
import type { User } from "@/src/lib/types";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";
import {
  Edit,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MoreHorizontal,
  UserCheck,
  UserX,
} from "lucide-react";
import { ExportButton } from "@/src/components/shared/export-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/src/components/ui/pagination";

interface UsuariosTableProps {
  usuarios: User[];
  onEdit: (usuario: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, activo: boolean) => void;
  currentUserId?: string;
  canDeleteUsers: boolean;
}

const getRolIcon = (rol: string) => {
  switch (rol) {
    case "administrador":
      return <ShieldCheck className="h-4 w-4" />;
    case "gerente":
      return <ShieldAlert className="h-4 w-4" />;
    case "supervisor_finca":
      return <Shield className="h-4 w-4" />;
    case "contador_rrhh":
      return <Shield className="h-4 w-4" />;
    case "bodeguero":
      return <Shield className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
};

const getRolColor = (rol: string) => {
  switch (rol) {
    case "administrador":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "gerente":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "supervisor_finca":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "contador_rrhh":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "bodeguero":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

export function UsuariosTable({
  usuarios,
  onEdit,
  onDelete,
  onToggleStatus,
  currentUserId,
  canDeleteUsers,
}: UsuariosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarioToDelete, setUsuarioToDelete] = useState<User | null>(null);
  const isMobile = useIsMobile();

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = filteredUsuarios.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const paginated = filteredUsuarios.slice(startIdx, endIdx);

  const handleDeleteClick = (usuario: User) => {
    setUsuarioToDelete(usuario);
  };

  const handleDeleteConfirm = () => {
    if (usuarioToDelete) {
      onDelete(usuarioToDelete.id);
      setUsuarioToDelete(null);
    }
  };

  const handleToggleStatusClick = (usuario: User) => {
    onToggleStatus(usuario.id, !usuario.activo);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                isMobile ? "Buscar..." : "Buscar por nombre, email o rol..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <ExportButton
            data={filteredUsuarios.map(u => ({
              ...u,
              estado: u.activo ? "Activo" : "Inactivo",
            }))}
            headers={["Nombre", "Email", "Rol", "Finca", "Teléfono", "Estado"]}
            keys={["nombre", "email", "rol", "fincaAsignada", "telefono", "estado"]}
            title="Listado de Usuarios"
            filename="usuarios"
          />
        </div>

        {paginated.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No se encontraron usuarios.
          </div>
        ) : (
          <div
            className={cn(
              "border rounded-lg overflow-x-auto overflow-y-auto max-h-[540px] animate-in fade-in duration-200",
              isMobile && "pb-4"
            )}
          >
            <Table className="text-sm min-w-[1000px]">
              <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead className={cn(isMobile && "hidden md:table-cell")}>
                  Email
                </TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className={cn(isMobile && "hidden md:table-cell")}>
                  Finca
                </TableHead>
                <TableHead className={cn(isMobile && "hidden lg:table-cell")}>
                  Teléfono
                </TableHead>
                <TableHead className={cn(isMobile && "hidden md:table-cell")}>
                  Estado
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody className="animate-in fade-in duration-200">
                {paginated.map((usuario) => (
                  <TableRow key={usuario.id} className="odd:bg-muted/50 hover:bg-muted transition-colors">
                    <TableCell className="font-medium">
                      {usuario.nombre}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRolColor(usuario.rol)}
                      >
                        <span className="mr-1">{getRolIcon(usuario.rol)}</span>
                        {usuario.rol.charAt(0).toUpperCase() +
                          usuario.rol.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{usuario.fincaAsignada || "Todas"}</TableCell>
                    <TableCell>{usuario.telefono || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.activo ? "default" : "secondary"}>
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(usuario)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatusClick(usuario)}
                            disabled={usuario.id === currentUserId}
                          >
                            {usuario.activo ? (
                              <UserX className="h-4 w-4 mr-2" />
                            ) : (
                              <UserCheck className="h-4 w-4 mr-2" />
                            )}
                            {usuario.activo ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                          {canDeleteUsers && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(usuario)}
                              disabled={usuario.id === currentUserId}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ver</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[90px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">por página</span>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" size="default" disabled={page <= 1} onClick={(e) => { e.preventDefault(); if (page > 1) setPage((p) => Math.max(1, p - 1)); }} />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" isActive={page === i + 1} size="icon" onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" size="default" disabled={page >= pageCount} onClick={(e) => { e.preventDefault(); if (page < pageCount) setPage((p) => Math.min(pageCount, p + 1)); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <AlertDialog
        open={!!usuarioToDelete}
        onOpenChange={() => setUsuarioToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario{" "}
              <strong>{usuarioToDelete?.nombre}</strong>. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
