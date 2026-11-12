import { Accordion, Anchor, Badge, Button, Checkbox, Table, TextInput } from '@mantine/core';

const variants = ['yellow', 'yellow-dark', 'navy', 'navy-step', 'outline', 'ring', 'menu'];
const sizes = ['nav', 'md', 'lg', 'step', 'submit', 'menu'];
export const meta = () => [{ name: 'robots', content: 'noindex' }];

export default function ThemePreview() {
  return (
    <main id="main-content" tabIndex={-1} style={{ maxWidth: 920, margin: 'auto', padding: 24 }}>
      <h1>Germandians theme</h1>
      {variants.map(variant => (
        <section key={variant}>
          <h2>{variant}</h2>
          {sizes.map(size => <Button key={size} variant={variant} size={size}>{size}</Button>)}
        </section>
      ))}
      <h2>States and controls</h2>
      <Button disabled>Disabled</Button> <Button loading>Loading</Button>
      <TextInput label="Name" placeholder="Full name" />
      <TextInput label="Email" error="Please enter a valid email address." />
      <Checkbox label="Consent" defaultChecked />
      <Accordion defaultValue="first">
        <Accordion.Item value="first"><Accordion.Control>Question</Accordion.Control><Accordion.Panel>Answer</Accordion.Panel></Accordion.Item>
      </Accordion>
      <Anchor href="#table">Table</Anchor> <Badge>Enquiries open</Badge>
      <Table id="table">
        <Table.Thead><Table.Tr><Table.Th>University</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody><Table.Tr><Table.Td>Example</Table.Td></Table.Tr></Table.Tbody>
      </Table>
    </main>
  );
}
