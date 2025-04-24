'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppShell from '@/components/AppShell';

export default function DesignSystemPage() {
  return (
    <AppShell pageTitle="Design System">
      <div className="space-y-12">
        {/* Typography */}
        <section id="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Text styles used throughout the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h1>Heading 1</h1>
                <h2>Heading 2</h2>
                <h3>Heading 3</h3>
                <h4>Heading 4</h4>
                <h5>Heading 5</h5>
                <h6>Heading 6</h6>
              </div>
              <div className="space-y-2">
                <p className="text-sm">Small text for captions and labels</p>
                <p>Regular paragraph text used for most content</p>
                <p className="text-lg">Larger text for emphasis</p>
                <p className="font-medium">Medium weight text</p>
                <p className="font-semibold">Semibold text</p>
                <p className="font-bold">Bold text</p>
                <p className="text-gradient">Gradient text</p>
                <a href="#" className="underline">Link style</a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Colors */}
        <section id="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color System</CardTitle>
              <CardDescription>Primary and semantic colors used in the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Primary Colors</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="p-4 rounded bg-[rgb(var(--primary-50))] text-[rgb(var(--primary-900))]">50</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-100))] text-[rgb(var(--primary-900))]">100</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-200))] text-[rgb(var(--primary-900))]">200</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-300))] text-[rgb(var(--primary-900))]">300</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-400))] text-white">400</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-500))] text-white">500</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-600))] text-white">600</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-700))] text-white">700</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-800))] text-white">800</div>
                    <div className="p-4 rounded bg-[rgb(var(--primary-900))] text-white">900</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Neutral Colors</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="p-4 rounded bg-[rgb(var(--neutral-50))] text-[rgb(var(--neutral-900))]">50</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-100))] text-[rgb(var(--neutral-900))]">100</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-200))] text-[rgb(var(--neutral-900))]">200</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-300))] text-[rgb(var(--neutral-900))]">300</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-400))] text-white">400</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-500))] text-white">500</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-600))] text-white">600</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-700))] text-white">700</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-800))] text-white">800</div>
                    <div className="p-4 rounded bg-[rgb(var(--neutral-900))] text-white">900</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Semantic Colors</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="p-4 rounded bg-[rgb(var(--success-50))] text-[rgb(var(--success-600))]">Success Light</div>
                      <div className="p-4 rounded bg-[rgb(var(--success-500))] text-white">Success</div>
                      <div className="p-4 rounded bg-[rgb(var(--success-600))] text-white">Success Dark</div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-4 rounded bg-[rgb(var(--warning-50))] text-[rgb(var(--warning-600))]">Warning Light</div>
                      <div className="p-4 rounded bg-[rgb(var(--warning-500))] text-white">Warning</div>
                      <div className="p-4 rounded bg-[rgb(var(--warning-600))] text-white">Warning Dark</div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-4 rounded bg-[rgb(var(--error-50))] text-[rgb(var(--error-600))]">Error Light</div>
                      <div className="p-4 rounded bg-[rgb(var(--error-500))] text-white">Error</div>
                      <div className="p-4 rounded bg-[rgb(var(--error-600))] text-white">Error Dark</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section id="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Button variants used throughout the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Button Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="primary">Primary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Button Sizes</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                  <Button variant="outline" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Button States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" disabled>Disabled</Button>
                  <Button variant="primary" isLoading>Loading</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section id="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>Card components for grouping related content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                    <CardDescription>This is a standard card with header and content.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card content goes here.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="primary" size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card variant="outline">
                  <CardHeader>
                    <CardTitle>Outline Card</CardTitle>
                    <CardDescription>A card with an outline style.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card content goes here.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card variant="ghost">
                  <CardHeader>
                    <CardTitle>Ghost Card</CardTitle>
                    <CardDescription>A card with minimal styling.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card content goes here.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm">Action</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form */}
        <section id="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Basic form components for user input</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Enter your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disabled">Disabled input</Label>
                    <Input id="disabled" disabled placeholder="Disabled input" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tables */}
        <section id="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tables</CardTitle>
              <CardDescription>Structured data presentation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of example transactions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>TRX-001</TableCell>
                    <TableCell>2023-04-12</TableCell>
                    <TableCell>₹24,500</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--success-50))] text-[rgb(var(--success-600))]">
                        Completed
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TRX-002</TableCell>
                    <TableCell>2023-04-14</TableCell>
                    <TableCell>₹18,200</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--warning-50))] text-[rgb(var(--warning-600))]">
                        Pending
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TRX-003</TableCell>
                    <TableCell>2023-04-15</TableCell>
                    <TableCell>₹12,750</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--error-50))] text-[rgb(var(--error-600))]">
                        Failed
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell colSpan={2}>₹55,450</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
} 