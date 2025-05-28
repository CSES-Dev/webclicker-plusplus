import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

const DeleteAlertDialog = AlertDialogPrimitive.Root;
const DeleteAlertDialogTrigger = AlertDialogPrimitive.Trigger;

const DeleteAlertDialogPortal = ({
    children,
    ...props
}: AlertDialogPrimitive.AlertDialogPortalProps) => (
    <AlertDialogPrimitive.Portal {...props}>
        <div className="fixed inset-0 z-50 flex items-center justify-center">{children}</div>
    </AlertDialogPrimitive.Portal>
);

const DeleteAlertDialogOverlay = forwardRef<
    ElementRef<typeof AlertDialogPrimitive.Overlay>,
    ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            className,
        )}
        {...props}
    />
));
DeleteAlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const DeleteAlertDialogContent = forwardRef<
    ElementRef<typeof AlertDialogPrimitive.Content>,
    ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
    <DeleteAlertDialogPortal>
        <DeleteAlertDialogOverlay />
        <AlertDialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed z-50 w-full max-w-lg gap-4 bg-white p-6 shadow-lg sm:rounded-lg",
                "translate-y-0 sm:translate-y-0",
                "data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:data-[state=open]:slide-in-from-top-[48%]",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-10 sm:data-[state=closed]:slide-out-to-top-[48%]",
                className,
            )}
            {...props}
        />
    </DeleteAlertDialogPortal>
));
DeleteAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const DeleteAlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-2 text-center sm:text-left mb-4", className)}
        {...props}
    />
);

const DeleteAlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
);

const DeleteAlertDialogTitle = forwardRef<
    ElementRef<typeof AlertDialogPrimitive.Title>,
    ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
    />
));
DeleteAlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const DeleteAlertDialogDescription = forwardRef<
    ElementRef<typeof AlertDialogPrimitive.Description>,
    ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DeleteAlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const DeleteAlertDialogAction = forwardRef<
    ElementRef<typeof AlertDialogPrimitive.Action>,
    ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            className,
        )}
        {...props}
    />
));
DeleteAlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const DeleteAlertDialogCancel = forwardRef<
    ElementRef<typeof AlertDialogPrimitive.Cancel>,
    ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
        ref={ref}
        className={cn(
            "mt-2 inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0",
            className,
        )}
        {...props}
    />
));
DeleteAlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
    DeleteAlertDialog,
    DeleteAlertDialogAction,
    DeleteAlertDialogCancel,
    DeleteAlertDialogContent,
    DeleteAlertDialogDescription,
    DeleteAlertDialogFooter,
    DeleteAlertDialogHeader,
    DeleteAlertDialogTitle,
    DeleteAlertDialogTrigger,
};
