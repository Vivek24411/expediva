import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  TRIP_CATEGORIES,
  TRIP_DIFFICULTIES,
  TRIP_STATUSES,
  type Trip,
} from '@shared/types';
import {
  Checkbox,
  Field,
  Input,
  ObjectListEditor,
  Section,
  Select,
  StringListEditor,
  Textarea,
} from '@/admin/components/fields';
import { ImageManager } from '@/admin/components/ImageManager';
import {
  emptyTripForm,
  slugify,
  tripFormSchema,
  tripToForm,
  type TripFormValues,
} from '@/admin/tripSchema';
import { useToast } from '@/components/ui/Toast';
import { api, queryKeys } from '@/lib/api';

type Errors = Partial<Record<string, string>>;

export default function AdminTripForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [values, setValues] = useState<TripFormValues>(emptyTripForm);
  const [errors, setErrors] = useState<Errors>({});
  /** Once the admin edits the slug by hand, stop deriving it from the title. */
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');

  // Edit mode loads from the full list — the API has no admin get-by-id route.
  const existing = useQuery({
    queryKey: queryKeys.trips({}),
    queryFn: () => api.listTrips({}),
    enabled: mode === 'edit',
  });

  const trip: Trip | undefined = useMemo(
    () => existing.data?.find((t) => t._id === id),
    [existing.data, id],
  );

  useEffect(() => {
    if (mode === 'edit' && trip) setValues(tripToForm(trip));
  }, [mode, trip]);

  const set = <K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const onTitleChange = (title: string) => {
    setValues((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  };

  const invalidateTrips = () => {
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.invalidateQueries({ queryKey: ['trip'] });
  };

  const save = useMutation({
    mutationFn: (payload: TripFormValues) => {
      const body = {
        ...payload,
        startDate: new Date(payload.startDate).toISOString(),
        endDate: new Date(payload.endDate).toISOString(),
        enrollmentDeadline: new Date(payload.enrollmentDeadline).toISOString(),
      };

      return mode === 'create' ? api.createTrip(body) : api.updateTrip(id!, body);
    },
    onSuccess: (saved) => {
      invalidateTrips();
      toast.success(mode === 'create' ? `“${saved.title}” created.` : `“${saved.title}” saved.`);
      navigate('/admin');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    const parsed = tripFormSchema.safeParse(values);

    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        // Nested paths become "itinerary.0.title" — good enough to surface inline.
        const key = issue.path.join('.');
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error('Some fields need fixing — check the highlighted ones.');
      return;
    }

    setErrors({});
    save.mutate(parsed.data);
  };

  if (mode === 'edit' && existing.isPending) {
    return <div className="h-64 animate-pulse bg-sand/60" />;
  }

  if (mode === 'edit' && !trip) {
    return (
      <div className="border border-hairline bg-paper p-12 text-center">
        <p className="font-display text-xl text-ink">Trip not found</p>
        <Link to="/admin" className="mt-6 inline-block bg-ink px-6 py-3 text-sm text-paper">
          Back to dashboard
        </Link>
      </div>
    );
  }

  /** Reports the first error under a nested array path, e.g. itinerary.2.title */
  const nestedError = (prefix: string): string | undefined => {
    const key = Object.keys(errors).find((k) => k.startsWith(`${prefix}.`));
    return key ? errors[key] : undefined;
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={1.6} />
            All trips
          </Link>
          <h1 className="mt-4 font-display text-3xl tracking-tight text-ink">
            {mode === 'create' ? 'New trip' : `Edit ${trip?.title}`}
          </h1>
        </div>

        <button
          type="submit"
          disabled={save.isPending}
          className="bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-ember disabled:opacity-55"
        >
          {save.isPending ? 'Saving…' : mode === 'create' ? 'Create trip' : 'Save changes'}
        </button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* ------------------------------------------------------- basics */}
        <Section title="Basics">
          <Field label="Title" htmlFor="title" error={errors.title}>
            <Input
              id="title"
              value={values.title}
              invalid={Boolean(errors.title)}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Kasol & Kheerganga Trek"
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="slug"
            error={errors.slug}
            hint={`Public URL: /trips/${values.slug || '…'}`}
          >
            <Input
              id="slug"
              value={values.slug}
              invalid={Boolean(errors.slug)}
              onChange={(e) => {
                setSlugTouched(true);
                set('slug', e.target.value);
              }}
              placeholder="kasol-kheerganga-trek"
            />
          </Field>

          <Field label="Destination" htmlFor="destination" error={errors.destination}>
            <Input
              id="destination"
              value={values.destination}
              invalid={Boolean(errors.destination)}
              onChange={(e) => set('destination', e.target.value)}
              placeholder="Kasol, Himachal Pradesh"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Category" htmlFor="category">
              <Select
                id="category"
                value={values.category}
                onChange={(e) => set('category', e.target.value as TripFormValues['category'])}
              >
                {TRIP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Difficulty" htmlFor="difficulty">
              <Select
                id="difficulty"
                value={values.difficulty}
                onChange={(e) => set('difficulty', e.target.value as TripFormValues['difficulty'])}
              >
                {TRIP_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status" htmlFor="status">
              <Select
                id="status"
                value={values.status}
                onChange={(e) => set('status', e.target.value as TripFormValues['status'])}
              >
                {TRIP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Pickup point" htmlFor="pickupPoint" error={errors.pickupPoint}>
            <Input
              id="pickupPoint"
              value={values.pickupPoint}
              invalid={Boolean(errors.pickupPoint)}
              onChange={(e) => set('pickupPoint', e.target.value)}
            />
          </Field>
        </Section>

        {/* --------------------------------------------- dates, price, seats */}
        <Section title="Dates, price & seats">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Start date" htmlFor="startDate" error={errors.startDate}>
              <Input
                id="startDate"
                type="date"
                value={values.startDate}
                invalid={Boolean(errors.startDate)}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </Field>

            <Field label="End date" htmlFor="endDate" error={errors.endDate}>
              <Input
                id="endDate"
                type="date"
                value={values.endDate}
                invalid={Boolean(errors.endDate)}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </Field>

            <Field label="Duration (days)" htmlFor="durationDays" error={errors.durationDays}>
              <Input
                id="durationDays"
                type="number"
                min={1}
                value={values.durationDays}
                invalid={Boolean(errors.durationDays)}
                onChange={(e) => set('durationDays', Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price (₹)" htmlFor="price" error={errors.price}>
              <Input
                id="price"
                type="number"
                min={0}
                value={values.price}
                invalid={Boolean(errors.price)}
                onChange={(e) => set('price', Number(e.target.value))}
              />
            </Field>

            <Field
              label="Original price (₹)"
              htmlFor="originalPrice"
              error={errors.originalPrice}
              hint="Optional — shown struck through."
            >
              <Input
                id="originalPrice"
                type="number"
                min={0}
                value={values.originalPrice ?? ''}
                invalid={Boolean(errors.originalPrice)}
                onChange={(e) =>
                  set('originalPrice', e.target.value === '' ? undefined : Number(e.target.value))
                }
              />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Total seats" htmlFor="seatsTotal" error={errors.seatsTotal}>
              <Input
                id="seatsTotal"
                type="number"
                min={1}
                value={values.seatsTotal}
                invalid={Boolean(errors.seatsTotal)}
                onChange={(e) => set('seatsTotal', Number(e.target.value))}
              />
            </Field>

            <Field label="Seats left" htmlFor="seatsLeft" error={errors.seatsLeft}>
              <Input
                id="seatsLeft"
                type="number"
                min={0}
                value={values.seatsLeft}
                invalid={Boolean(errors.seatsLeft)}
                onChange={(e) => set('seatsLeft', Number(e.target.value))}
              />
            </Field>
          </div>
        </Section>

        {/* ------------------------------------------------------ enrollment */}
        <Section title="Enrollment" hint="Students pay inside the Google Form, not on the site.">
          <Field label="Google Form link" htmlFor="formLink" error={errors.formLink}>
            <Input
              id="formLink"
              type="url"
              value={values.formLink}
              invalid={Boolean(errors.formLink)}
              onChange={(e) => set('formLink', e.target.value)}
              placeholder="https://forms.gle/…"
            />
          </Field>

          <Field
            label="Enrollment deadline"
            htmlFor="enrollmentDeadline"
            error={errors.enrollmentDeadline}
            hint="Drives the countdown timer on the trip page."
          >
            <Input
              id="enrollmentDeadline"
              type="date"
              value={values.enrollmentDeadline}
              invalid={Boolean(errors.enrollmentDeadline)}
              onChange={(e) => set('enrollmentDeadline', e.target.value)}
            />
          </Field>

          <Checkbox
            label="Enrollment open"
            hint="Turning this off shows “Enrollment Closed” instead of the CTA."
            checked={values.enrollmentOpen}
            onChange={(next) => set('enrollmentOpen', next)}
          />
        </Section>

        {/* ---------------------------------------------------------- images */}
        <Section title="Images">
          <ImageManager
            heroImage={values.heroImage}
            gallery={values.gallery}
            error={errors.heroImage}
            onChange={({ heroImage, gallery }) =>
              setValues((prev) => ({ ...prev, heroImage, gallery }))
            }
          />
        </Section>

        {/* ------------------------------------------------------ the lists */}
        <Section title="Highlights">
          <StringListEditor
            label="Highlights"
            values={values.highlights}
            onChange={(next) => set('highlights', next)}
            placeholder="Overnight camping beside the hot springs"
          />
          {nestedError('highlights') ? (
            <p className="text-xs text-ember">{nestedError('highlights')}</p>
          ) : null}
        </Section>

        <Section title="Inclusions & exclusions">
          <StringListEditor
            label="Inclusions"
            values={values.inclusions}
            onChange={(next) => set('inclusions', next)}
            placeholder="Return travel from IIT Roorkee"
          />
          <StringListEditor
            label="Exclusions"
            values={values.exclusions}
            onChange={(next) => set('exclusions', next)}
            placeholder="Lunch and personal snacks"
          />
        </Section>

        <Section title="Things to carry">
          <StringListEditor
            label="Things to carry"
            values={values.thingsToCarry}
            onChange={(next) => set('thingsToCarry', next)}
            placeholder="Trekking shoes with good grip"
          />
        </Section>

        <Section title="Itinerary">
          <ObjectListEditor
            label="Days"
            values={values.itinerary}
            onChange={(next) => set('itinerary', next)}
            blank={(i) => ({ day: i + 1, title: '', description: '' })}
            addLabel="Add a day"
            renderRow={(day, _i, patch) => (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
                  <Input
                    type="number"
                    min={1}
                    value={day.day}
                    aria-label="Day number"
                    onChange={(e) => patch({ day: Number(e.target.value) })}
                  />
                  <Input
                    value={day.title}
                    aria-label="Day title"
                    placeholder="Barshaini → Kheerganga trek"
                    onChange={(e) => patch({ title: e.target.value })}
                  />
                </div>
                <Textarea
                  value={day.description}
                  aria-label="Day description"
                  placeholder="What happens on this day…"
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>
            )}
          />
          {nestedError('itinerary') ? (
            <p className="text-xs text-ember">{nestedError('itinerary')}</p>
          ) : null}
        </Section>

        <Section title="Trip FAQs">
          <ObjectListEditor
            label="FAQs"
            values={values.faqs}
            onChange={(next) => set('faqs', next)}
            blank={() => ({ q: '', a: '' })}
            addLabel="Add a question"
            renderRow={(faq, _i, patch) => (
              <div className="space-y-3">
                <Input
                  value={faq.q}
                  aria-label="Question"
                  placeholder="How hard is this trek?"
                  onChange={(e) => patch({ q: e.target.value })}
                />
                <Textarea
                  value={faq.a}
                  aria-label="Answer"
                  placeholder="Answer in plain language…"
                  onChange={(e) => patch({ a: e.target.value })}
                />
              </div>
            )}
          />
          {nestedError('faqs') ? <p className="text-xs text-ember">{nestedError('faqs')}</p> : null}
        </Section>
      </div>

      <div className="sticky bottom-0 mt-8 flex justify-end gap-3 border-t border-hairline bg-ivory/95 py-4 backdrop-blur-sm">
        <Link
          to="/admin"
          className="border border-hairline px-6 py-3.5 text-sm text-ink transition-colors hover:border-ink"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={save.isPending}
          className="bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-ember disabled:opacity-55"
        >
          {save.isPending ? 'Saving…' : mode === 'create' ? 'Create trip' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
