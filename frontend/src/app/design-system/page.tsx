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
import { Truck, HardHat, Hammer, Package } from 'lucide-react';

export default function DesignSystemPage() {
  return (
    <AppShell pageTitle="Design System">
      <div className="space-y-12">
        {/* Brand Overview */}
        <section id="brand-overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>OM Transport Brand</CardTitle>
              <CardDescription>Construction Transport Dashboard Design System</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <Truck size={32} className="text-[rgb(var(--navy-500))]" />
                    <span className="ml-3 text-3xl font-bold">
                      <span className="text-[rgb(var(--navy-500))]">OM</span>
                      <span className="text-[rgb(var(--yellow-400))]">Transport</span>
                    </span>
                  </div>
                  <p className="text-[rgb(var(--steel-600))]">
                    A comprehensive design system for the OM Transport dashboard, focused on professionalism,
                    reliability, and construction industry standards. The color palette and styling elements 
                    are designed to create a consistent, user-friendly interface for transport management.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[rgb(var(--navy-500))] mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">Navy</span>
                    </div>
                    <div className="text-xs">#0A3054</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[rgb(var(--yellow-400))] mb-2 flex items-center justify-center">
                      <span className="text-[rgb(var(--navy-500))] font-bold">Yellow</span>
                    </div>
                    <div className="text-xs">#FFCC00</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[rgb(var(--steel-500))] mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">Steel</span>
                    </div>
                    <div className="text-xs">#465662</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography */}
        <section id="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Font families and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Roboto - Primary Font</h3>
                <div className="space-y-2">
                  <div className="flex items-end gap-4">
                    <h1 className="text-3xl">Heading 1</h1>
                    <span className="text-[rgb(var(--steel-400))] text-sm">32px / Roboto Bold</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <h2 className="text-2xl">Heading 2</h2>
                    <span className="text-[rgb(var(--steel-400))] text-sm">24px / Roboto Bold</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <h3 className="text-xl">Heading 3</h3>
                    <span className="text-[rgb(var(--steel-400))] text-sm">22px / Roboto Bold</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <h4 className="text-lg">Heading 4</h4>
                    <span className="text-[rgb(var(--steel-400))] text-sm">18px / Roboto Bold</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Body Text</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-bold mb-1">Regular - 16px</p>
                    <p>This is the standard body text used throughout the application for readability.</p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Small - 14px</p>
                    <p className="text-sm">Used for secondary information and in compact UI elements.</p>
                  </div>
                  <div>
                    <p className="font-bold mb-1">Extra Small - 12px</p>
                    <p className="text-xs">Used for footnotes, captions, and metadata.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Text Styles</h3>
                <div className="space-y-2">
                  <p className="font-normal">Regular (400) - Primary body text</p>
                  <p className="font-medium">Medium (500) - Emphasis, subheadings</p>
                  <p className="font-bold">Bold (700) - Headers, important content</p>
                  <p className="text-gradient">Gradient text effect</p>
                  <p className="text-construction">Construction gradient text effect</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Colors */}
        <section id="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color System</CardTitle>
              <CardDescription>Brand colors and palettes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-3">Primary Colors</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-[rgb(var(--navy-500))] flex items-end p-3">
                        <span className="text-white font-bold">Navy Blue</span>
                      </div>
                      <p className="text-sm text-center">#0A3054</p>
                      <p className="text-xs text-center text-[rgb(var(--steel-500))]">Professionalism, Reliability</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-[rgb(var(--yellow-400))] flex items-end p-3">
                        <span className="text-[rgb(var(--navy-500))] font-bold">Construction Yellow</span>
                      </div>
                      <p className="text-sm text-center">#FFCC00</p>
                      <p className="text-xs text-center text-[rgb(var(--steel-500))]">Caution, Visibility</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-[rgb(var(--steel-500))] flex items-end p-3">
                        <span className="text-white font-bold">Steel Gray</span>
                      </div>
                      <p className="text-sm text-center">#465662</p>
                      <p className="text-xs text-center text-[rgb(var(--steel-500))]">Strength, Durability</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Secondary Colors</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-[rgb(var(--concrete-400))] flex items-end p-3">
                        <span className="text-[rgb(var(--navy-500))] font-bold">Concrete Gray</span>
                      </div>
                      <p className="text-sm text-center">#D0D0D0</p>
                      <p className="text-xs text-center text-[rgb(var(--steel-500))]">Neutral background</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-[rgb(var(--brown-500))] flex items-end p-3">
                        <span className="text-white font-bold">Earth Brown</span>
                      </div>
                      <p className="text-sm text-center">#8B572A</p>
                      <p className="text-xs text-center text-[rgb(var(--steel-500))]">Construction materials</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-[rgb(var(--orange-500))] flex items-end p-3">
                        <span className="text-white font-bold">Safety Orange</span>
                      </div>
                      <p className="text-sm text-center">#FF5500</p>
                      <p className="text-xs text-center text-[rgb(var(--steel-500))]">Alerts, important info</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Accent Colors</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-[rgb(var(--success-500))] flex items-end p-3">
                        <span className="text-white font-bold">Success Green</span>
                      </div>
                      <p className="text-sm text-center">#2E8B57</p>
                      <p className="text-xs text-center text-[rgb(var(--steel-500))]">Positive metrics, confirmations</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 rounded-lg bg-[rgb(var(--error-500))] flex items-end p-3">
                        <span className="text-white font-bold">Alert Red</span>
                      </div>
                      <p className="text-sm text-center">#D22B2B</p>
                      <p className="text-xs text-center text-[rgb(var(--steel-500))]">Critical notifications, errors</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Color Tints</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 font-medium">Navy Blue</p>
                      <div className="grid grid-cols-5 gap-1">
                        <div className="p-4 rounded bg-[rgb(var(--navy-50))] text-[rgb(var(--navy-900))]">50</div>
                        <div className="p-4 rounded bg-[rgb(var(--navy-100))] text-[rgb(var(--navy-900))]">100</div>
                        <div className="p-4 rounded bg-[rgb(var(--navy-300))] text-[rgb(var(--navy-900))]">300</div>
                        <div className="p-4 rounded bg-[rgb(var(--navy-500))] text-white">500</div>
                        <div className="p-4 rounded bg-[rgb(var(--navy-700))] text-white">700</div>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 font-medium">Construction Yellow</p>
                      <div className="grid grid-cols-5 gap-1">
                        <div className="p-4 rounded bg-[rgb(var(--yellow-50))] text-[rgb(var(--yellow-900))]">50</div>
                        <div className="p-4 rounded bg-[rgb(var(--yellow-100))] text-[rgb(var(--yellow-900))]">100</div>
                        <div className="p-4 rounded bg-[rgb(var(--yellow-300))] text-[rgb(var(--yellow-900))]">300</div>
                        <div className="p-4 rounded bg-[rgb(var(--yellow-400))] text-[rgb(var(--yellow-900))]">400</div>
                        <div className="p-4 rounded bg-[rgb(var(--yellow-600))] text-white">600</div>
                      </div>
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
              <CardDescription>Button variants and states based on brand guidelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Button Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="primary">Primary</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">Navy Blue</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="secondary">Secondary</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">White/Navy</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="action">Action</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">Yellow</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="alert">Alert</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">Safety Orange</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="outline">Outline</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">Bordered</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="ghost">Ghost</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">Subtle</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Button Sizes</h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="primary" size="sm">Small</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">14px</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="primary" size="md">Medium</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">16px</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="primary" size="lg">Large</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">18px</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Hammer size={18} />
                    </Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">Icon</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Button States</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="primary" disabled>Disabled</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">50% opacity</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Button variant="primary" isLoading>Loading</Button>
                    <span className="text-xs text-[rgb(var(--steel-500))]">With spinner</span>
                  </div>
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
              <CardDescription>Card components with 8px rounded corners and subtle shadows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                    <CardDescription>With border and shadow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card content with standard styling. Used for most content sections.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="primary" size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card variant="outline">
                  <CardHeader>
                    <CardTitle>Outline Card</CardTitle>
                    <CardDescription>Border only</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Outline style for secondary content or low-emphasis sections.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card variant="muted">
                  <CardHeader>
                    <CardTitle>Muted Card</CardTitle>
                    <CardDescription>Subtle background</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Muted style for tertiary content or background sections.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" size="sm">Action</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Elements */}
        <section id="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Input fields and form components</CardDescription>
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

                <div>
                  <h3 className="text-lg font-medium mb-4">Form Guidelines</h3>
                  <ul className="space-y-2 list-disc pl-5 text-sm text-[rgb(var(--steel-600))]">
                    <li>Use clear, descriptive labels above input fields</li>
                    <li>Provide helper text for complex inputs</li>
                    <li>Use placeholder text sparingly</li>
                    <li>Group related form fields logically</li>
                    <li>Provide clear validation messages</li>
                    <li>Use consistent styling for all form elements</li>
                  </ul>
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
              <CardDescription>Data presentation with visual hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Example Transport Schedule</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>TRK-001</TableCell>
                    <TableCell>Raj Sharma</TableCell>
                    <TableCell>Mumbai - Pune</TableCell>
                    <TableCell>
                      <span className="badge badge-success">
                        In Transit
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TRK-002</TableCell>
                    <TableCell>Amit Patel</TableCell>
                    <TableCell>Delhi - Jaipur</TableCell>
                    <TableCell>
                      <span className="badge badge-warning">
                        Delayed
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TRK-003</TableCell>
                    <TableCell>Sunil Kumar</TableCell>
                    <TableCell>Chennai - Bangalore</TableCell>
                    <TableCell>
                      <span className="badge badge-error">
                        Breakdown
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Fleet Status Summary</TableCell>
                    <TableCell colSpan={2}>3 vehicles active</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Icons */}
        <section id="icons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Icons</CardTitle>
              <CardDescription>Line icons with 2px stroke weight</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-md bg-[rgb(var(--steel-50))] flex items-center justify-center">
                    <Truck size={32} className="text-[rgb(var(--navy-500))]" />
                  </div>
                  <span className="text-sm font-medium">Transport</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-md bg-[rgb(var(--steel-50))] flex items-center justify-center">
                    <HardHat size={32} className="text-[rgb(var(--navy-500))]" />
                  </div>
                  <span className="text-sm font-medium">Construction</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-md bg-[rgb(var(--steel-50))] flex items-center justify-center">
                    <Package size={32} className="text-[rgb(var(--navy-500))]" />
                  </div>
                  <span className="text-sm font-medium">Materials</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-md bg-[rgb(var(--steel-50))] flex items-center justify-center">
                    <Hammer size={32} className="text-[rgb(var(--navy-500))]" />
                  </div>
                  <span className="text-sm font-medium">Tools</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
} 