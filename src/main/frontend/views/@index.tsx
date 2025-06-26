import { ActionOnLostSubscription } from '@vaadin/hilla-frontend';
import { useSignal } from '@vaadin/hilla-react-signals';
import {
  Button,
  DatePicker,
  Dialog,
  Grid,
  GridColumn,
  HorizontalLayout,
  Icon,
  Notification,
  TextField,
  VerticalLayout,
} from '@vaadin/react-components';
import { ViewToolbar } from 'Frontend/components/ViewToolbar';
import Reservation from 'Frontend/generated/de/rwi/hillakafkaexample/reservation/Reservation';
import { KafkaConsumerService, KafkaProducerService } from 'Frontend/generated/endpoints';
import { useEffect } from 'react';
import { useForm } from '@vaadin/hilla-react-form';
import ReservationModel from 'Frontend/generated/de/rwi/hillakafkaexample/reservation/ReservationModel';

export default function ReservationsView() {
  const reservations = useSignal<Reservation[]>();
  const subscriptionNotificationOpened = useSignal<boolean>(false);
  const subscriptionNotificationMessage = useSignal<string | undefined>(undefined);
  const newReservationDialogOpened = useSignal<boolean>(false);
  const { model, field, clear, submit, invalid } = useForm(ReservationModel, {
    onSubmit: async (reservation: Reservation) => {
      await KafkaProducerService.produce(reservation);
      closeNewReservationDialog();
    },
  });

  useEffect(() => {
    const reservationSubscription = KafkaConsumerService.getLatestReservation()
      .onNext((reservation: Reservation) => {
        reservations.value = [...(reservations.value ?? []), reservation];
      })
      .onError((message: string) => {
        subscriptionNotificationOpened.value = true;
        subscriptionNotificationMessage.value = message;
      })
      .onSubscriptionLost(() => ActionOnLostSubscription.RESUBSCRIBE);
    return () => reservationSubscription.cancel();
  }, []);

  const closeSubscriptionNotification = () => {
    subscriptionNotificationOpened.value = false;
    subscriptionNotificationMessage.value = undefined;
  };

  const closeNewReservationDialog = () => {
    newReservationDialogOpened.value = false;
    clear();
  };

  const retrySubscription = () => {
    window.location.reload();
  };

  return (
    <VerticalLayout theme="margin">
      <ViewToolbar title="Reservations" />
      <Grid items={reservations.value}>
        <GridColumn path={'id'} />
        <GridColumn path={'date'} />
        <GridColumn path={'customer'} />
      </Grid>
      <HorizontalLayout theme="margin" className="self-end">
        <Button theme="primary" onClick={() => (newReservationDialogOpened.value = true)}>
          New reservation
        </Button>
      </HorizontalLayout>
      <Dialog
        headerTitle={'New reservation'}
        opened={newReservationDialogOpened.value}
        onOpenedChanged={({ detail }) => {
          newReservationDialogOpened.value = detail.value;
        }}
        footer={
          <>
            <Button onClick={closeNewReservationDialog}>Cancel</Button>
            <Button theme="primary" disabled={invalid} onClick={submit}>
              Add
            </Button>
          </>
        }>
        <VerticalLayout style={{ alignItems: 'stretch', width: '18rem', maxWidth: '100%' }}>
          <TextField label="ID" {...field(model.id)} />
          <DatePicker label="Date" {...field(model.date)} />
          <TextField label="Customer" {...field(model.customer)} />
        </VerticalLayout>
      </Dialog>
      <Notification
        theme="warning"
        duration={0}
        position="middle"
        opened={subscriptionNotificationOpened.value}
        onOpenedChanged={(event) => {
          subscriptionNotificationOpened.value = event.detail.value;
        }}>
        <HorizontalLayout theme="spacing" style={{ alignItems: 'center' }}>
          <div>{subscriptionNotificationMessage.value ?? 'Failed to subscribe to reactive reservation endpoint'}</div>
          <Button theme="tertiary-inline" style={{ marginLeft: 'var(--lumo-space-xl)' }} onClick={retrySubscription}>
            Retry
          </Button>
          <Button theme="tertiary-inline icon" onClick={closeSubscriptionNotification} aria-label="Close">
            <Icon icon="lumo:cross" />
          </Button>
        </HorizontalLayout>
      </Notification>
    </VerticalLayout>
  );
}
