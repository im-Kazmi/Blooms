import { StoreIcon } from 'lucide-react';
import {
  TextureCard,
  TextureCardContent,
  TextureCardHeader,
  TextureSeparator,
} from '../../components/custom/texture-card';
import { CreateStoreForm } from '../../components/forms/create-store-form';

export default function CreateStorePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground items-center justify-center">
      <TextureCard className="">
        <TextureCardHeader className="flex flex-col gap-4 justify-center items-center  ">
          <div className="p-3 bg-gradient-to-b from-red-400/60 to-red-500/60 rounded-full">
            <StoreIcon className="h-4 w-4 stroke-neutral-200" />
          </div>
          <h1>Create a Store</h1>
        </TextureCardHeader>
        <TextureCardContent className=" w-full">
          <CreateStoreForm />
        </TextureCardContent>
        <TextureSeparator />
      </TextureCard>
    </div>
  );
}
