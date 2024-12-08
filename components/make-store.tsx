"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
import pb from "@/api/pocketbase";
import { useAccount, useWalletClient } from "wagmi";
const formSchema = z.object({
  name: z.string().default("").optional(),
  description: z.string().default("").optional(),
  zkProof: z.string().optional(), // Keep this as a string to store the file content
  menu: z.string().optional(),
  price: z.coerce.number().optional(),
  image: z.string().optional(),
  menu2: z.string().optional(),
  price2: z.coerce.number().optional(),
  image2: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const MakeStore: React.FC = () => {
  const { address } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const action = "Create";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Mc Donald",
      description:
        "World famous fast food chain. Serving burgers, fries, and more.",
      menu: "Big Mac®",
      price: 10,
      image:
        "https://s7d1.scene7.com/is/image/mcdonalds/DC_202302_0005-999_BigMac_1564x1564-1?wid=1000&hei=1000&dpr=off",
      menu2: "Chicken McNuggets®",
      price2: 5,
      image2:
        "https://s7d1.scene7.com/is/image/mcdonaldsstage/DC_202006_0483_4McNuggets_Stacked_1564x1564?wid=1000&hei=1000&dpr=off",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const formData = {
        ...data,
        owner: address,
        requestId: "",
      };

      // If zkProof is provided, parse the JSON from the uploaded file
      if (data.zkProof) {
        try {
          const zkProof = JSON.parse(data.zkProof);
          console.log(zkProof);
        } catch (error) {
          alert("Invalid JSON format");
          setLoading(false);
          return;
        }
      }

      const createdItem = await pb.collection("orderwrap").create(formData);
      console.log(createdItem.id);
      router.replace("/");
      router.refresh();
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  // Handle file change event to parse the file
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        form.setValue("zkProof", fileContent); // Set the file content as zkProof
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-10"
        >
          <div className="space-y-3">
            <h1 className="font-bold text-lg">Store Info</h1>
            <Separator />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Store name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zkProof"
              render={() => (
                <FormItem>
                  <FormLabel>Credential (Upload JSON file)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      disabled={loading}
                      onChange={handleFileChange}
                      accept=".json"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-3">
            <h1 className="font-bold text-lg">Menu1</h1>
            <Separator />
            <FormField
              control={form.control}
              name="menu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Menu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USDT)</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-3">
            <h1 className="font-bold text-lg">Menu2</h1>
            <Separator />
            <FormField
              control={form.control}
              name="menu2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Menu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (USDT)</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
