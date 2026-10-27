type Props = {
  webstore: {
    name: string;
    organizationName: string;
    url: string;
  };
};
export function EditingForm({ webstore }: Props) {
  const { name } = webstore;

  return (
    <div className="vert-flex-group">
      <div>
        <h2 style={{ marginBottom: 0 }}>Name</h2>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="input-major"
          defaultValue={name}
        />
      </div>
    </div>
  );
}
