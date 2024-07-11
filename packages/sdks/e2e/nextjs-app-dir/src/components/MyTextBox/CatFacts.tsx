'use server';

export interface TextProps {
  text: string;
}

async function CatFacts(props: TextProps) {
  const catFacts = await fetch('https://cat-fact.herokuapp.com/facts').then(
    (x) => x.json()
  );
  return (
    <div>
      {props.text}. Here are some cat facts from an RSC:
      <ul style={{ display: 'flex', flexDirection: 'column' }}>
        {catFacts.slice(3).map((fact: { _id: string; text: string }) => (
          <li
            key={fact._id}
            style={{
              padding: '10px',
            }}
          >
            <span
              className="builder-text"
              style={{
                outline: 'none',
              }}
            >
              {fact.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CatFacts;
