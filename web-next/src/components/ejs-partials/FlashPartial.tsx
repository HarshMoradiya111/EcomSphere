import type { FlashPartialProps } from './types';

export default function FlashPartial({ success = [], errors = [] }: FlashPartialProps) {
  return (
    <>
      {success.length > 0 && (
        <div className="flash-message flash-success">
          {success.map((msg, idx) => (
            <p key={`success-${idx}`}>
              <i className="fa-solid fa-circle-check"></i> {msg}
            </p>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="flash-message flash-error">
          {errors.map((msg, idx) => (
            <p key={`error-${idx}`}>
              <i className="fa-solid fa-circle-exclamation"></i> {msg}
            </p>
          ))}
        </div>
      )}
    </>
  );
}
