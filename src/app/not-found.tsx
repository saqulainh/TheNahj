import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-medium text-foreground">404</h1>
      <p className="mt-4 text-muted">This page could not be found.</p>
      <Button href="/" className="mt-8">
        Back home
      </Button>
    </section>
  );
}
