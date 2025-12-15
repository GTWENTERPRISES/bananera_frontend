"use client";

import type { Finca } from "@/src/lib/types";
import { Button } from "@/src/components/ui/button";
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
import {
  Edit,
  Trash2,
  MapPin,
  User,
  Search,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { ExportButton } from "@/src/components/shared/export-button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";

interface FincasTableProps {
  fincas: Finca[];
  onEdit: (finca: Finca) => void;
  onDelete: (id: string) => void;
  // Propiedades para validaciones de seguridad
  canDeleteFincas?: boolean;
  fincasConRegistros?: string[]; // IDs de fincas que tienen registros asociados
}

export function FincasTable({
  fincas,
  onEdit,
  onDelete,
  canDeleteFincas = true,
  fincasConRegistros = [],
}: FincasTableProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [fincaToDelete, setFincaToDelete] = useState<Finca | null>(null);

  const filteredFincas = fincas.filter(
    (finca) =>
      finca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (finca.ubicacion || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (finca.responsable &&
        finca.responsable.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (finca.variedad || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = filteredFincas.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const paginated = filteredFincas.slice(startIdx, endIdx);

  const handleDeleteClick = (finca: Finca) => {
    // Verificar si la finca tiene registros asociados
    if (fincasConRegistros.includes(finca.id)) {
      toast.error(
        "No se puede eliminar la finca porque tiene registros asociados (enfundes, cosechas, etc.)"
      );
      return;
    }

    // Verificar permisos
    if (!canDeleteFincas) {
      toast.error("No tienes permisos para eliminar fincas");
      return;
    }

    setFincaToDelete(finca);
  };

  const handleDeleteConfirm = () => {
    if (fincaToDelete) {
      onDelete(fincaToDelete.id);
      setFincaToDelete(null);
    }
  };

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case "activa":
        return <Badge variant="default">Activa</Badge>;
      case "inactiva":
        return <Badge variant="secondary">Inactiva</Badge>;
      case "mantenimiento":
        return <Badge variant="outline">Mantenimiento</Badge>;
      default:
        return <Badge variant="default">Activa</Badge>;
    }
  };

  // Verificar si una finca tiene registros asociados
  const tieneRegistrosAsociados = (fincaId: string) => {
    return fincasConRegistros.includes(fincaId);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                isMobile
                  ? "Buscar..."
                  : "Buscar por nombre, ubicación o responsable..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <ExportButton
            data={filteredFincas}
            headers={[
              "Nombre",
              "Hectáreas",
              "Plantas",
              "Variedad",
              "Responsable",
              "Ubicación",
              "Estado",
              "Teléfono",
            ]}
            keys={[
              "nombre",
              "hectareas",
              "plantasTotales",
              "variedad",
              "responsable",
              "ubicacion",
              "estado",
              "telefono",
            ]}
            title="Listado de Fincas"
            filename="fincas"
          />
        </div>

        {/* Información sobre fincas con registros */}
        {fincasConRegistros.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Fincas con registros asociados
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {fincasConRegistros.length} finca(s) no pueden ser eliminadas
                  porque tienen registros de producción asociados.
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className={cn(
            "border rounded-lg overflow-x-auto",
            isMobile && "pb-4"
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finca</TableHead>
                <TableHead className={cn(isMobile && "hidden md:table-cell")}>
                  Hectáreas
                </TableHead>
                <TableHead className={cn(isMobile && "hidden md:table-cell")}>
                  Plantas
                </TableHead>
                <TableHead className={cn(isMobile && "hidden md:table-cell")}>
                  Variedad
                </TableHead>
                <TableHead className={cn(isMobile && "hidden lg:table-cell")}>
                  Responsable
                </TableHead>
                <TableHead className={cn(isMobile && "hidden lg:table-cell")}>
                  Ubicación
                </TableHead>
                <TableHead className={cn(isMobile && "hidden md:table-cell")}>
                  Estado
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      <p>No se encontraron fincas</p>
                      <p className="text-sm">
                        Intenta con otros términos de búsqueda
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((finca) => {
                  const tieneRegistros = tieneRegistrosAsociados(finca.id);
                  const puedeEliminar = canDeleteFincas && !tieneRegistros;

                  return (
                    <TableRow key={finca.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 w-fit"
                          >
                            {finca.nombre}
                          </Badge>
                          {isMobile && (
                            <div className="mt-1 text-xs text-muted-foreground space-y-1">
                              <div>
                                {finca.variedad} - {finca.hectareas} ha
                              </div>
                              <div>
                                {typeof finca.plantasTotales === "number"
                                  ? finca.plantasTotales.toLocaleString()
                                  : "-"}{" "}
                                plantas
                              </div>
                              <div>{getEstadoBadge(finca.estado)}</div>
                              {tieneRegistros && (
                                <div className="text-amber-600 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Con registros</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(isMobile && "hidden md:table-cell")}
                      >
                        {finca.hectareas} ha
                      </TableCell>
                      <TableCell
                        className={cn(isMobile && "hidden md:table-cell")}
                      >
                        {typeof finca.plantasTotales === "number"
                          ? finca.plantasTotales.toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell
                        className={cn(isMobile && "hidden md:table-cell")}
                      >
                        {finca.variedad}
                      </TableCell>
                      <TableCell
                        className={cn(isMobile && "hidden lg:table-cell")}
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{finca.responsable}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(isMobile && "hidden lg:table-cell")}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {finca.ubicacion}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn(isMobile && "hidden md:table-cell")}
                      >
                        {getEstadoBadge(finca.estado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(finca)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(finca)}
                              className={cn(
                                "text-red-600",
                                !puedeEliminar &&
                                  "opacity-50 cursor-not-allowed"
                              )}
                              disabled={!puedeEliminar}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                              {tieneRegistros && (
                                <span className="ml-1 text-xs">
                                  (Con registros)
                                </span>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ver</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
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
                <PaginationPrevious
                  href="#"
                  size="default"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={page === i + 1}
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  size="default"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(pageCount, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      <AlertDialog
        open={!!fincaToDelete}
        onOpenChange={() => setFincaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la finca{" "}
              <strong>{fincaToDelete?.nombre}</strong>. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
