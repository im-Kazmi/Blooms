import { Button } from "@repo/design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@repo/design-system/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash } from "@repo/design-system/icons";
// import { useOpenAccount } from "../hooks/use-open-account";
// import { useDeleteAccount } from "../api/use-delete-account";
import { useConfirm } from "@repo/design-system/hooks/use-confirm";

type Props = {
  id: string;
};
const ProductActions = ({ id }: Props) => {
  // const { onOpen } = useOpenAccount();
  // const deleteMutation = useDeleteAccount(id);

  const [ConfirmationDialog, confirm] = useConfirm({
    title: "Are you sure! 🖐️",
    message: "This will permanently delete this Product!",
  });

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) {
      // deleteMutation.mutate();
    }
  };

  return (
    <>
      <ConfirmationDialog />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant={"ghost"} className=" size-8 p-0">
            <MoreHorizontal className=" size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
          // disabled={deleteMutation.isPending}
          // onClick={() => onOpen(id)}
          >
            <Edit className=" size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            // disabled={deleteMutation.isPending}
            onClick={onDelete}
          >
            <Trash className=" size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProductActions;
